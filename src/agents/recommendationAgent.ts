import type { Agent } from "./base";
import type {
  AgentContext,
  LifestyleContext,
  PersonaMixEntry,
  Recommendation,
  RecommendationCard,
  ScheduleEntry,
  StyleIntent,
  UserIntent,
  UserPreferences,
  WardrobeItem,
  WeatherSummary,
  BodyProfile,
  Persona
} from "../contracts/agentTypes";
import type { WardrobeSummary } from "./wardrobeAgent";
import type { HistorySummary } from "./historyAgent";
import type { FeedbackSummary } from "./feedbackAgent";
import { personas } from "../data/personas";
import { buildRenderSpec } from "../render/renderSpec";

export type RecommendationInput = {
  context: AgentContext;
  weather?: WeatherSummary;
  wardrobe: WardrobeSummary;
  history: HistorySummary;
  feedback: FeedbackSummary;
  schedule: ScheduleEntry[];
  styleIntent: StyleIntent;
  lifestyleContext: LifestyleContext;
  startDate: string;
  endDate: string;
  intent: UserIntent;
  preferences: UserPreferences;
  bodyProfile?: BodyProfile;
};

const pickFirst = (items: WardrobeItem[]): WardrobeItem[] =>
  items.length > 0 ? [items[0]] : [];

const fallbackItem = (items: WardrobeItem[]): WardrobeItem | undefined =>
  items.length > 0 ? items[0] : undefined;

const fallbackAnyItem = (itemsByCategory: WardrobeSummary["itemsByCategory"]) =>
  fallbackItem([
    ...itemsByCategory.top,
    ...itemsByCategory.bottom,
    ...itemsByCategory.outer,
    ...itemsByCategory.shoes,
    ...itemsByCategory.accessory
  ]);

const findItemByCategory = (
  itemsByCategory: WardrobeSummary["itemsByCategory"],
  category: WardrobeItem["category"]
) => fallbackItem(itemsByCategory[category]);

const normalizeWeights = (entries: PersonaMixEntry[]): PersonaMixEntry[] => {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0) || 1;
  return entries.map((entry) => ({
    ...entry,
    weight: Number((entry.weight / total).toFixed(2))
  }));
};

const computePersonaMix = (
  context: AgentContext,
  prefs: UserPreferences
): { mix: PersonaMixEntry[]; chosen: Persona[] } => {
  const regionLower = context.region.toLowerCase();
  const scored = personas.map((persona) => {
    let score = 1;
    if (persona.city_culture.toLowerCase() === regionLower) {
      score += 2;
    }
    if (prefs.color_preference === "neutral" && persona.palette.base.includes("black")) {
      score += 1;
    }
    if (prefs.fit_preference === "relaxed" && persona.normalized.silhouette === "mixed") {
      score += 1;
    }
    return { persona, score };
  });

  const chosen = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.persona);

  const mix = normalizeWeights(
    chosen.map((persona, index) => ({
      persona_id: persona.id,
      weight: index === 0 ? 0.5 : 0.25,
      reason:
        index === 0
          ? "Matches core wardrobe vibe and preferred palette."
          : "Balances mobility and comfort preferences."
    }))
  );

  return { mix, chosen };
};

const buildCard = (params: {
  label: RecommendationCard["label"];
  items: {
    top: WardrobeItem;
    bottom: WardrobeItem;
    shoes: WardrobeItem;
    outerwear?: WardrobeItem;
  };
  avatarGender: Persona["gender_category"];
  silhouette: Persona["silhouette"];
  bodyProfile?: BodyProfile;
  uiTags: string[];
}): RecommendationCard => {
  const renderItems = [
    params.items.top,
    params.items.bottom,
    params.items.shoes,
    params.items.outerwear
  ].filter(Boolean) as WardrobeItem[];

  return {
    label: params.label,
    outfit_items: params.items,
    render_spec: buildRenderSpec({
      items: renderItems,
      avatarGender: params.avatarGender,
      silhouette: params.silhouette,
      bodyProfile: params.bodyProfile
    }),
    ui_tags: params.uiTags.slice(0, 3)
  };
};

export const recommendationAgent: Agent<RecommendationInput, Recommendation> = {
  name: "recommendationAgent",
  async run(input) {
    const itemsByCategory = input.wardrobe.itemsByCategory;
    const top = findItemByCategory(itemsByCategory, "top") ?? fallbackAnyItem(itemsByCategory);
    const bottom = findItemByCategory(itemsByCategory, "bottom") ?? fallbackAnyItem(itemsByCategory);
    const shoes = findItemByCategory(itemsByCategory, "shoes") ?? fallbackAnyItem(itemsByCategory);
    const outer = findItemByCategory(itemsByCategory, "outer");

    if (!top || !bottom || !shoes) {
      const fallbackItem = fallbackAnyItem(itemsByCategory);
      if (!fallbackItem) {
        throw new Error("Wardrobe is empty; unable to build outfit cards.");
      }

      return {
        persona_mix: [],
        cards: [
          {
            label: "Most Loved",
            outfit_items: {
              top: top ?? fallbackItem,
              bottom: bottom ?? fallbackItem,
              shoes: shoes ?? fallbackItem
            },
            render_spec: buildRenderSpec({
              items: [top ?? fallbackItem, bottom ?? fallbackItem, shoes ?? fallbackItem].filter(Boolean) as WardrobeItem[],
              avatarGender: "non-binary",
              silhouette: "mixed",
              bodyProfile: input.bodyProfile
            }),
            ui_tags: ["incomplete", "needs-wardrobe"]
          },
          {
            label: "Iconic",
            outfit_items: {
              top: top ?? fallbackItem,
              bottom: bottom ?? fallbackItem,
              shoes: shoes ?? fallbackItem
            },
            render_spec: buildRenderSpec({
              items: [top ?? fallbackItem, bottom ?? fallbackItem, shoes ?? fallbackItem].filter(Boolean) as WardrobeItem[],
              avatarGender: "non-binary",
              silhouette: "mixed",
              bodyProfile: input.bodyProfile
            }),
            ui_tags: ["incomplete", "needs-wardrobe"]
          }
        ],
        purchase_suggestions: input.preferences.purchase_opt_in
          ? [
              {
                item_type: "top/bottom/shoes",
                constraints: ["wardrobe coverage insufficient"]
              }
            ]
          : []
      };
    }

    const { mix, chosen } = computePersonaMix(input.context, input.preferences);
    const primaryPersona = chosen[0];
    const secondaryPersona = chosen[1] ?? primaryPersona;

    const mostLoved = buildCard({
      label: "Most Loved",
      items: {
        top,
        bottom,
        shoes,
        outerwear: outer
      },
      avatarGender: primaryPersona.gender_category,
      silhouette: primaryPersona.silhouette,
      bodyProfile: input.bodyProfile,
      uiTags: ["comfortable", "familiar", "easy"]
    });

    const iconic = buildCard({
      label: "Iconic",
      items: {
        top,
        bottom,
        shoes,
        outerwear: outer
      },
      avatarGender: secondaryPersona.gender_category,
      silhouette: secondaryPersona.silhouette,
      bodyProfile: input.bodyProfile,
      uiTags: ["signature", "distinct", "polished"]
    });

    const missingCategories: WardrobeItem["category"][] = [];
    if (!outer) missingCategories.push("outer");

    const purchaseSuggestions =
      input.preferences.purchase_opt_in && missingCategories.length > 0
        ? missingCategories.slice(0, 3).map((category) => ({
            item_type: category,
            constraints: input.preferences.discomfort_avoidance.length > 0
              ? input.preferences.discomfort_avoidance
              : ["comfort-first"]
          }))
        : [];

    return {
      persona_mix: mix,
      cards: [mostLoved, iconic],
      purchase_suggestions: purchaseSuggestions
    };
  }
};
