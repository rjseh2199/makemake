import type { AgentContext, Recommendation, ValidationIssue, WardrobeItem, OutfitHistoryEntry, FeedbackEntry, ScheduleEntry, ConversationTurn } from "../contracts/agentTypes";
import { weatherAgent } from "./weatherAgent";
import { wardrobeAgent } from "./wardrobeAgent";
import { historyAgent } from "./historyAgent";
import { feedbackAgent } from "./feedbackAgent";
import { conversationAgent } from "./conversationAgent";
import { contextAgent } from "./contextAgent";
import { recommendationAgent } from "./recommendationAgent";
import { validationAgent } from "./validationAgent";

export type OrchestratorInput = {
  context: AgentContext;
  startDate: string;
  endDate: string;
  wardrobeItems: WardrobeItem[];
  history: OutfitHistoryEntry[];
  feedback: FeedbackEntry[];
  schedule: ScheduleEntry[];
  conversation: ConversationTurn[];
};

export type OrchestratorResult = {
  recommendation: Recommendation;
  validationIssues: ValidationIssue[];
};

export const orchestrateWeeklyRecommendation = async (
  input: OrchestratorInput
): Promise<OrchestratorResult> => {
  const [weather, wardrobe, history, feedback, styleIntent, environment] = await Promise.all([
    weatherAgent.run({
      context: input.context,
      startDate: input.startDate,
      endDate: input.endDate
    }),
    wardrobeAgent.run({ context: input.context, items: input.wardrobeItems }),
    historyAgent.run({ context: input.context, history: input.history }),
    feedbackAgent.run({ context: input.context, feedback: input.feedback }),
    conversationAgent.run({ conversation: input.conversation }),
    contextAgent.run({
      schedule: input.schedule,
      feedback: input.feedback,
      conversation: input.conversation
    })
  ]);

  const recommendation = await recommendationAgent.run({
    context: input.context,
    weather,
    wardrobe,
    history,
    feedback,
    schedule: input.schedule,
    styleIntent,
    environment
  });

  const validationIssues = await validationAgent.run({ recommendation });

  return { recommendation, validationIssues };
};
