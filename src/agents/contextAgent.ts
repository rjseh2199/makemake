import type { Agent } from "./base";
import type {
  ConversationTurn,
  EnvironmentSummary,
  FeedbackEntry,
  ScheduleEntry
} from "../contracts/agentTypes";

export type ContextInput = {
  schedule: ScheduleEntry[];
  feedback: FeedbackEntry[];
  conversation: ConversationTurn[];
};

const toLower = (value: string) => value.toLowerCase();

const extractEventTags = (value: string): string[] => {
  const normalized = toLower(value);
  const tags: string[] = [];
  if (normalized.includes("데이트")) {
    tags.push("date");
  }
  if (normalized.includes("출장") || normalized.includes("비즈니스")) {
    tags.push("business");
  }
  if (normalized.includes("여행")) {
    tags.push("travel");
  }
  if (normalized.includes("파티") || normalized.includes("모임")) {
    tags.push("party");
  }
  return tags;
};

const unique = <T>(items: T[]): T[] => Array.from(new Set(items));

export const contextAgent: Agent<ContextInput, EnvironmentSummary> = {
  name: "contextAgent",
  async run(input) {
    const locations = input.schedule
      .map((entry) => entry.location)
      .filter((value): value is string => Boolean(value));

    const formalityMix = input.schedule.reduce(
      (acc, entry) => {
        if (entry.formality === "smart-casual") {
          acc.smartCasual += 1;
        } else if (entry.formality === "formal") {
          acc.formal += 1;
        } else {
          acc.casual += 1;
        }
        return acc;
      },
      { casual: 0, smartCasual: 0, formal: 0 }
    );

    const moods = input.schedule
      .map((entry) => entry.mood)
      .filter((value): value is string => Boolean(value));

    const eventTags = unique(
      input.schedule.flatMap((entry) =>
        extractEventTags([entry.title, entry.mood].filter(Boolean).join(" "))
      )
    );

    const feedbackSignals = unique(
      input.feedback.flatMap((entry) => [entry.feedback, ...(entry.tags ?? [])])
    );

    const conversationSignals = unique(
      input.conversation.flatMap((turn) => extractEventTags(turn.content))
    );

    return {
      scheduleCount: input.schedule.length,
      locations: unique(locations),
      formalityMix,
      moods: unique(moods),
      eventTags: unique([...eventTags, ...conversationSignals]),
      intentSignals: feedbackSignals
    };
  }
};
