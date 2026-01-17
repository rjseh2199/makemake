import type {
  AgentContext,
  BodyProfile,
  Persona,
  PersonaMixEntry,
  Recommendation,
  RecommendationCard,
  UserPreferences,
  WardrobeItem
} from "../contracts/agentTypes";
import { personas } from "../data/personas";
import { buildRenderSpec } from "../render/renderSpec";

export type PersonaMixInput = {
  context: AgentContext;
  preferences: UserPreferences;
  feedbackTags: string[];
  wardrobe: WardrobeItem[];
  moodSignals: string[];
  intent: "daily" | "weekly" | "quiz";
};

const normalizeWeights = (entries: PersonaMixEntry[]): PersonaMixEntry[] => {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0) || 1;
  return entries.map((entry) => ({
    ...entry,
    weight: Number((entry.weight / total).toFixed(2))
  }));
};

const scorePersona = (persona: Persona, input: PersonaMixInput): number => {
  let score = 1;
  const regionLower = input.context.region.toLowerCase();
  if (persona.city_culture.toLowerCase() === regionLower) {
    score += 2;
  }
  if (input.preferences.color_preference === "neutral" &&
    persona.palette.base.includes("black")) {
    score += 1;
  }
  if (input.preferences.fit_preference === "relaxed" &&
    persona.normalized.silhouette === "mixed") {
    score += 1;
  }
  if (input.moodSignals.some((mood) => mood.toLowerCase().includes("romantic")) &&
    persona.signature_items.some((item) => item.includes("silk"))) {
    score += 1;
  }
  if (input.intent === "quiz") {
    score += 0.5;
  }
  return score;
};

export const computePersonaMix = (
  input: PersonaMixInput
): { mix: PersonaMixEntry[]; chosen: Persona[] } => {
  const scored = personas.map((persona) => ({
    persona,
    score: scorePersona(persona, input)
  }));

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
          ? "Matches core preferences and local context."
          : "Balances comfort, palette, and mobility."
    }))
  );

  return { mix, chosen };
};

const filterDiscomfort = (
  items: WardrobeItem[],
  preferences: UserPreferences
): WardrobeItem[] => {
  const dislikes = preferences.discomfort_avoidance.map((item) => item.toLowerCase());
  if (dislikes.length === 0) return items;
  return items.filter((item) => {
    const tokens = [
      item.subcategory ?? "",
      item.material ?? "",
      item.pattern ?? ""
    ].join(" ").toLowerCase();
    return !dislikes.some((rule) => tokens.includes(rule));
  });
};

const findFirstByCategory = (
  items: WardrobeItem[],
  category: WardrobeItem["category"]
): WardrobeItem | undefined =>
  items.find((item) => item.category === category);

const fallbackAnyItem = (items: WardrobeItem[]): WardrobeItem | undefined =>
  items[0];

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

export type RecommendationInputCore = {
  context: AgentContext;
  intent: "daily" | "weekly" | "quiz";
  preferences: UserPreferences;
  wardrobeItems: WardrobeItem[];
  feedbackTags: string[];
  moodSignals: string[];
  bodyProfile?: BodyProfile;
};

export const generateRecommendation = (
  input: RecommendationInputCore
): Recommendation => {
  const filteredItems = filterDiscomfort(input.wardrobeItems, input.preferences);
  const top = findFirstByCategory(filteredItems, "top") ?? fallbackAnyItem(filteredItems);
  const bottom =
    findFirstByCategory(filteredItems, "bottom") ?? fallbackAnyItem(filteredItems);
  const shoes =
    findFirstByCategory(filteredItems, "shoes") ?? fallbackAnyItem(filteredItems);
  const outer =
    findFirstByCategory(filteredItems, "outer");

  if (!top || !bottom || !shoes) {
    throw new Error("Wardrobe is empty; unable to build outfit cards.");
  }

  const { mix, chosen } = computePersonaMix({
    context: input.context,
    preferences: input.preferences,
    feedbackTags: input.feedbackTags,
    wardrobe: input.wardrobeItems,
    moodSignals: input.moodSignals,
    intent: input.intent
  });

  const primaryPersona = chosen[0];
  const secondaryPersona = chosen[1] ?? primaryPersona;
  const iconicOuter = outer ?? findFirstByCategory(filteredItems, "accessory");

  const mostLoved = buildCard({
    label: "Most Loved",
    items: { top, bottom, shoes, outerwear: outer },
    avatarGender: primaryPersona.gender_category,
    silhouette: primaryPersona.silhouette,
    bodyProfile: input.bodyProfile,
    uiTags: ["comfortable", "familiar", "easy"]
  });

  const iconic = buildCard({
    label: "Iconic",
    items: { top, bottom, shoes, outerwear: iconicOuter ?? outer },
    avatarGender: secondaryPersona.gender_category,
    silhouette: secondaryPersona.silhouette,
    bodyProfile: input.bodyProfile,
    uiTags: ["signature", "distinct", "polished"]
  });

  const purchaseSuggestions =
    input.preferences.purchase_opt_in && !outer
      ? [
          {
            item_type: "outer",
            constraints: input.preferences.discomfort_avoidance.length > 0
              ? input.preferences.discomfort_avoidance
              : ["comfort-first"]
          }
        ]
      : [];

  return {
    persona_mix: mix,
    cards: [mostLoved, iconic],
    purchase_suggestions: purchaseSuggestions
  };
};
