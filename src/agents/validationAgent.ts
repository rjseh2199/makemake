import type { Agent } from "./base";
import type { Recommendation, ValidationIssue } from "../contracts/agentTypes";

export type ValidationInput = {
  recommendation: Recommendation;
};

export const validationAgent: Agent<ValidationInput, ValidationIssue[]> = {
  name: "validationAgent",
  async run(input) {
    const issues: ValidationIssue[] = [];

    if (input.recommendation.outfits.length === 0) {
      issues.push({
        severity: "warning",
        message: "No outfits were generated for the week."
      });
    }

    const hasMissingItems = input.recommendation.missingItems.length > 0;
    if (hasMissingItems) {
      issues.push({
        severity: "info",
        message: "Missing item recommendations are available."
      });
    }

    return issues;
  }
};
