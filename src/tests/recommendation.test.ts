import { orchestrateWeeklyRecommendation } from "../agents/orchestrator";
import type {
  AgentContext,
  BodyProfile,
  ConversationTurn,
  FeedbackEntry,
  OutfitHistoryEntry,
  ScheduleEntry,
  UserPreferences,
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

const preferences: UserPreferences = {
  color_preference: "mixed",
  fit_preference: "mixed",
  discomfort_avoidance: [],
  novelty_preference: "repeat_ok",
  purchase_opt_in: false
};

const bodyProfile: BodyProfile = {
  height_cm: 170,
  weight_kg: 60
};

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
    conversation,
    intent: "weekly",
    preferences,
    bodyProfile
  });

  assertCondition(
    result.recommendation.cards.length === 2,
    "Should return exactly two cards"
  );
  assertCondition(
    result.recommendation.cards.every((card) =>
      card.render_spec.image_data_url.startsWith("data:image/svg+xml")
    ),
    "Cards should include rendered images"
  );
  assertCondition(
    result.recommendation.cards[0].label === "Most Loved" &&
      result.recommendation.cards[1].label === "Iconic",
    "Cards should be labeled Most Loved and Iconic"
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
