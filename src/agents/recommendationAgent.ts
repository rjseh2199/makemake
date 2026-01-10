import type { Agent } from "./base";
import type {
  AgentContext,
  EnvironmentSummary,
  Recommendation,
  ScheduleEntry,
  StyleIntent,
  WardrobeItem,
  WeatherSummary
} from "../contracts/agentTypes";
import type { WardrobeSummary } from "./wardrobeAgent";
import type { HistorySummary } from "./historyAgent";
import type { FeedbackSummary } from "./feedbackAgent";

export type RecommendationInput = {
  context: AgentContext;
  weather: WeatherSummary;
  wardrobe: WardrobeSummary;
  history: HistorySummary;
  feedback: FeedbackSummary;
  schedule: ScheduleEntry[];
  styleIntent: StyleIntent;
  environment: EnvironmentSummary;
};

const pickFirst = (items: WardrobeItem[]): WardrobeItem[] =>
  items.length > 0 ? [items[0]] : [];

export const recommendationAgent: Agent<RecommendationInput, Recommendation> = {
  name: "recommendationAgent",
  async run(input) {
    const top = pickFirst(input.wardrobe.itemsByCategory.top);
    const bottom = pickFirst(input.wardrobe.itemsByCategory.bottom);
    const outer = pickFirst(input.wardrobe.itemsByCategory.outer);
    const shoes = pickFirst(input.wardrobe.itemsByCategory.shoes);
    const accessories = pickFirst(input.wardrobe.itemsByCategory.accessory);

    return {
      weekOf: input.weather.startDate,
      outfits: [
        {
          day: input.weather.startDate,
          items: [...top, ...bottom, ...outer, ...shoes, ...accessories],
          mood: input.feedback.extractedTags[0] ?? "balanced",
          vibe: input.styleIntent.desiredVibes[0] ?? "arcade-90s",
          colorPalette: ["neon purple", "electric blue", "black"],
          materials: ["denim", "cotton", "synthetic"],
          accessories: ["retro sneakers", "chunky belt"],
          notes: `Context-aware stub: ${input.environment.eventTags.join(", ") || "general"} focus.`
        }
      ],
      missingItems: [],
      highlights: [
        `Context signals: ${input.environment.eventTags.join(", ") || "none"}`,
        `Formality mix: casual ${input.environment.formalityMix.casual}, smart-casual ${input.environment.formalityMix.smartCasual}, formal ${input.environment.formalityMix.formal}`,
        `Mood keywords: ${input.environment.moods.join(", ") || "none"}`,
        `Style intent: ${input.styleIntent.level} (${input.styleIntent.desiredVibes.join(", ")})`,
        `Weather signal: ${input.weather.temperatureRangeC[0]}-${input.weather.temperatureRangeC[1]}C`
      ]
    };
  }
};
