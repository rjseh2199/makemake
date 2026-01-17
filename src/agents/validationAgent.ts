import type { Agent } from "./base";
import type { Recommendation, ValidationIssue } from "../contracts/agentTypes";

export type ValidationInput = {
  recommendation: Recommendation;
};

export const validationAgent: Agent<ValidationInput, ValidationIssue[]> = {
  name: "validationAgent",
  async run(input) {
    const issues: ValidationIssue[] = [];

    if (input.recommendation.cards.length !== 2) {
      issues.push({
        severity: "warning",
        message: "Expected exactly two outfit cards (Most Loved, Iconic)."
      });
    }

    const labels = input.recommendation.cards.map((card) => card.label);
    if (!labels.includes("Most Loved") || !labels.includes("Iconic")) {
      issues.push({
        severity: "warning",
        message: "Cards must include both Most Loved and Iconic labels."
      });
    }

    input.recommendation.cards.forEach((card) => {
      if (!card.render_spec.image_data_url) {
        issues.push({
          severity: "warning",
          message: `${card.label} card is missing a rendered image.`
        });
      }
    });

    return issues;
  }
};
