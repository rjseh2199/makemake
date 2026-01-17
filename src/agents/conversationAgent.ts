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

    const lowered = combined.toLowerCase();
    const effortLevel = lowered.includes("꾸안꾸")
      ? "balanced"
      : lowered.includes("미니멀")
      ? "minimal"
      : lowered.includes("맥시멀")
      ? "maximal"
      : "maximal";
    const vibes: StyleIntent["desiredVibes"] = [];
    if (combined.includes("싸이월드")) {
      vibes.push("cyworld");
    }
    if (combined.includes("90") || combined.includes("90년")) {
      vibes.push("arcade-90s");
    }
    if (combined.includes("00") || combined.includes("00년")) {
      vibes.push("arcade-00s");
    }
    if (vibes.length === 0) {
      vibes.push("arcade-90s");
    }

    const keywords = Array.from(new Set(extractKeywords(combined)));
    return {
      level: effortLevel,
      desiredVibes: vibes,
      keywords,
      emotions: ["excited"]
    };
  }
};
