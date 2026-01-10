import { orchestrateWeeklyRecommendation } from "../agents/orchestrator";
import type {
  AgentContext,
  ConversationTurn,
  FeedbackEntry,
  OutfitHistoryEntry,
  ScheduleEntry,
  WardrobeItem
} from "../contracts/agentTypes";

const context: AgentContext = {
  apiKey: "test",
  model: "test-model",
  region: "Seoul",
  currentDate: "2025-01-01",
  locationConsent: false
};

const wardrobeItems: WardrobeItem[] = [
  {
    id: "top-1",
    category: "top",
    color: "black",
    season: "all",
    condition: "good"
  }
];

const history: OutfitHistoryEntry[] = [
  {
    date: "2024-12-30",
    outfitItemIds: ["top-1"]
  }
];

const feedback: FeedbackEntry[] = [
  {
    date: "2024-12-31",
    feedback: "좋았어요",
    tags: ["casual"]
  }
];

const schedule: ScheduleEntry[] = [
  {
    date: "2025-01-02",
    title: "데이트",
    formality: "smart-casual",
    mood: "romantic"
  }
];

const conversation: ConversationTurn[] = [
  {
    role: "user",
    content: "이번 주는 데이트가 있어요. 90년대 감성으로."
  }
];

const assertCondition = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async () => {
  const result = await orchestrateWeeklyRecommendation({
    context,
    startDate: context.currentDate,
    endDate: context.currentDate,
    wardrobeItems,
    history,
    feedback,
    schedule,
    conversation
  });

  assertCondition(
    result.recommendation.outfits.length > 0,
    "Should return outfits"
  );
  assertCondition(
    result.recommendation.highlights.some((entry) =>
      entry.includes("Schedule items: 1")
    ),
    "Highlights should include schedule count"
  );
  assertCondition(
    result.recommendation.highlights.some((entry) =>
      entry.includes("Style intent: maximal")
    ),
    "Highlights should include style intent"
  );
};

run()
  .then(() => {
    console.log("recommendation.test.ts passed");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
