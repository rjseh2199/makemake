import type { Agent } from "./base";
import type { AgentContext, WeatherSummary } from "../contracts/agentTypes";

export type WeatherInput = {
  context: AgentContext;
  startDate: string;
  endDate: string;
};

export const weatherAgent: Agent<WeatherInput, WeatherSummary> = {
  name: "weatherAgent",
  async run(input) {
    const useNeighborhood = Boolean(
      input.context.locationConsent && input.context.location
    );

    return {
      region: input.context.region,
      startDate: input.startDate,
      endDate: input.endDate,
      temperatureRangeC: [5, 18],
      precipitationChance: 0.25,
      source: useNeighborhood ? "kma-neighborhood" : "kma-short-term",
      notes: useNeighborhood
        ? "Stub weather summary. Replace with KMA neighborhood forecast."
        : "Stub weather summary. Replace with KMA short-term forecast."
    };
  }
};
