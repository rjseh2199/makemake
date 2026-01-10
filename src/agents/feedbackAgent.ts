import type { Agent } from "./base";
import type { AgentContext, FeedbackEntry } from "../contracts/agentTypes";

export type FeedbackInput = {
  context: AgentContext;
  feedback: FeedbackEntry[];
};

export type FeedbackSummary = {
  totalEntries: number;
  recentFeedback: FeedbackEntry[];
  extractedTags: string[];
};

export const feedbackAgent: Agent<FeedbackInput, FeedbackSummary> = {
  name: "feedbackAgent",
  async run(input) {
    const extractedTags = Array.from(
      new Set(input.feedback.flatMap((entry) => entry.tags ?? []))
    );

    return {
      totalEntries: input.feedback.length,
      recentFeedback: input.feedback.slice(-7),
      extractedTags
    };
  }
};
