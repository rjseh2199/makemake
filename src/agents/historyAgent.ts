import type { Agent } from "./base";
import type { AgentContext, OutfitHistoryEntry } from "../contracts/agentTypes";

export type HistoryInput = {
  context: AgentContext;
  history: OutfitHistoryEntry[];
};

export type HistorySummary = {
  totalEntries: number;
  recentOutfits: OutfitHistoryEntry[];
  mostRecentDate?: string;
};

export const historyAgent: Agent<HistoryInput, HistorySummary> = {
  name: "historyAgent",
  async run(input) {
    const sorted = [...input.history].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    const mostRecent = sorted.at(-1);

    return {
      totalEntries: input.history.length,
      recentOutfits: sorted.slice(-7),
      mostRecentDate: mostRecent?.date
    };
  }
};
