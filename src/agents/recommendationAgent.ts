import type { Agent } from "./base";
import type {
  AgentContext,
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
          notes: "Stub recommendation based on first items."
        }
      ],
      missingItems: [],
      highlights: [
        `Weather range ${input.weather.temperatureRangeC[0]}-${input.weather.temperatureRangeC[1]}C`,
        `Recent outfits tracked: ${input.history.totalEntries}`,
        `Schedule items: ${input.schedule.length}`,
        `Style intent: ${input.styleIntent.level}`
      ]
    };
  }
};
