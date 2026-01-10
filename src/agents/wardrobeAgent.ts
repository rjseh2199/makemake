import type { Agent } from "./base";
import type { AgentContext, WardrobeItem } from "../contracts/agentTypes";

export type WardrobeInput = {
  context: AgentContext;
  items: WardrobeItem[];
};

export type WardrobeSummary = {
  totalItems: number;
  itemsByCategory: Record<WardrobeItem["category"], WardrobeItem[]>;
};

export const wardrobeAgent: Agent<WardrobeInput, WardrobeSummary> = {
  name: "wardrobeAgent",
  async run(input) {
    const itemsByCategory: WardrobeSummary["itemsByCategory"] = {
      top: [],
      bottom: [],
      outer: [],
      shoes: [],
      accessory: []
    };

    input.items.forEach((item) => {
      itemsByCategory[item.category].push(item);
    });

    return {
      totalItems: input.items.length,
      itemsByCategory
    };
  }
};
