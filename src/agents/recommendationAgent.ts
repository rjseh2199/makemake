import type { Agent } from "./base";
import type {
  AgentContext,
  LifestyleContext,
  Recommendation,
  ScheduleEntry,
  StyleIntent,
  UserIntent,
  UserPreferences,
  WeatherSummary,
  BodyProfile
} from "../contracts/agentTypes";
import type { HistorySummary } from "./historyAgent";
import type { FeedbackSummary } from "./feedbackAgent";
import type { WardrobeSummary } from "./wardrobeAgent";
import { generateRecommendation } from "../core/recommendationEngine";

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

export const recommendationAgent: Agent<RecommendationInput, Recommendation> = {
  name: "recommendationAgent",
  async run(input) {
    return generateRecommendation({
      context: input.context,
      intent: input.intent,
      preferences: input.preferences,
      wardrobeItems: [
        ...input.wardrobe.itemsByCategory.top,
        ...input.wardrobe.itemsByCategory.bottom,
        ...input.wardrobe.itemsByCategory.outer,
        ...input.wardrobe.itemsByCategory.shoes,
        ...input.wardrobe.itemsByCategory.accessory
      ],
      feedbackTags: input.feedback.extractedTags,
      moodSignals: input.lifestyleContext.moodSignals,
      bodyProfile: input.bodyProfile
    });
  }
};
