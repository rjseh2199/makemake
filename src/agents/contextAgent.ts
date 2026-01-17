import type { Agent } from "./base";
import type {
  FeedbackEntry,
  LifestyleContext,
  ScheduleEntry,
  StyleIntent
} from "../contracts/agentTypes";

export type ContextInput = {
  schedule: ScheduleEntry[];
  feedback: FeedbackEntry[];
  styleIntent: StyleIntent;
};

const unique = (items: string[]): string[] =>
  Array.from(new Set(items.filter((item) => item.trim().length > 0)));

const collectScheduleSummary = (schedule: ScheduleEntry[]) => {
  const formalityCounts = {
    casual: 0,
    "smart-casual": 0,
    formal: 0
  };

  schedule.forEach((entry) => {
    if (entry.formality) {
      formalityCounts[entry.formality] += 1;
    }
  });

  const locations = unique(
    schedule.map((entry) => entry.location ?? "").filter(Boolean)
  );

  return {
    totalEvents: schedule.length,
    dateCount: unique(schedule.map((entry) => entry.date)).length,
    locations,
    formalityCounts,
    notableEvents: schedule.map((entry) => entry.title).slice(0, 3)
  };
};

export const contextAgent: Agent<ContextInput, LifestyleContext> = {
  name: "contextAgent",
  async run(input) {
    const scheduleSummary = collectScheduleSummary(input.schedule);
    const feedbackTags = input.feedback.flatMap((entry) => entry.tags ?? []);
    const feedbackMoods = input.feedback.map((entry) => entry.mood ?? "");
    const scheduleMoods = input.schedule.map((entry) => entry.mood ?? "");

    return {
      schedule: scheduleSummary,
      moodSignals: unique([
        ...scheduleMoods,
        ...feedbackMoods,
        ...input.styleIntent.emotions
      ]),
      keywords: unique([...input.styleIntent.keywords, ...feedbackTags]),
      effortLevel: input.styleIntent.level,
      desiredVibes: input.styleIntent.desiredVibes
    };
  }
};
