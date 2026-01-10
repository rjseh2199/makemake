import type { Agent } from "./base";
import type {
  AgentContext,
  LifestyleContext,
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
  weather?: WeatherSummary;
  wardrobe: WardrobeSummary;
  history: HistorySummary;
  feedback: FeedbackSummary;
  schedule: ScheduleEntry[];
  styleIntent: StyleIntent;
  lifestyleContext: LifestyleContext;
  startDate: string;
  endDate: string;
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
    const firstScheduleDate = input.schedule[0]?.date ?? input.startDate;
    const weatherNote = input.weather
      ? `Weather range ${input.weather.temperatureRangeC[0]}-${input.weather.temperatureRangeC[1]}C`
      : "Weather not emphasized in MVP";

    return {
      weekOf: input.startDate,
      outfits: [
        {
          day: firstScheduleDate,
          items: [...top, ...bottom, ...outer, ...shoes, ...accessories],
          mood:
            input.lifestyleContext.moodSignals[0] ??
            input.feedback.extractedTags[0] ??
            "balanced",
          vibe:
            input.lifestyleContext.desiredVibes[0] ??
            input.styleIntent.desiredVibes[0] ??
            "arcade-90s",
          colorPalette: ["neon purple", "electric blue", "black"],
          materials: ["denim", "cotton", "synthetic"],
          accessories: ["retro sneakers", "chunky belt"],
          notes:
            "Stub recommendation based on wardrobe availability and lifestyle context."
        }
      ],
      missingItems: [],
      highlights: [
        `Lifestyle effort: ${input.lifestyleContext.effortLevel}`,
        `Schedule events: ${input.lifestyleContext.schedule.totalEvents}`,
        `Mood signals: ${input.lifestyleContext.moodSignals.join(", ") || "none"}`,
        `Desired vibes: ${input.lifestyleContext.desiredVibes.join(", ") || "none"}`,
        `Recent outfits tracked: ${input.history.totalEntries}`,
        weatherNote
      ]
    };
  }
};
