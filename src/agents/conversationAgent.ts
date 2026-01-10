import type { Agent } from "./base";
import type { ConversationTurn, StyleIntent } from "../contracts/agentTypes";

export type ConversationInput = {
  conversation: ConversationTurn[];
};

const extractKeywords = (text: string): string[] =>
  text
    .split(/[\s,./]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2);

export const conversationAgent: Agent<ConversationInput, StyleIntent> = {
  name: "conversationAgent",
  async run(input) {
    const combined = input.conversation
      .filter((turn) => turn.role === "user")
      .map((turn) => turn.content)
      .join(" ");

    const keywords = Array.from(new Set(extractKeywords(combined)));
    return {
      level: "maximal",
      desiredVibes: ["cyworld", "arcade-90s"],
      keywords,
      emotions: ["excited"]
    };
  }
};
