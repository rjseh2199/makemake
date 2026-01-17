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
    material: "cotton",
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

const runCase = async (params: {
  wardrobe: WardrobeItem[];
  preferences: UserPreferences;
  label: string;
}) => {
  const result = await orchestrateWeeklyRecommendation({
    context,
    startDate: context.currentDate,
    endDate: context.currentDate,
    wardrobeItems: params.wardrobe,
    history,
    feedback,
    schedule,
    conversation,
    intent: "weekly",
    preferences: params.preferences,
    bodyProfile
  });

  assertCondition(
    result.recommendation.cards.length === 2,
    `${params.label}: Should return exactly two cards`
  );
  assertCondition(
    result.recommendation.cards[0].label === "Most Loved" &&
      result.recommendation.cards[1].label === "Iconic",
    `${params.label}: Cards should be labeled Most Loved and Iconic`
  );
  assertCondition(
    result.recommendation.cards.every((card) =>
      card.render_spec.image_data_url.startsWith("data:image/svg+xml")
    ),
    `${params.label}: Cards should include rendered images`
  );
  assertCondition(
    result.recommendation.cards.every((card) =>
      Boolean(card.outfit_items.top && card.outfit_items.bottom && card.outfit_items.shoes)
    ),
    `${params.label}: Cards should include top/bottom/shoes`
  );
  assertCondition(
    result.recommendation.cards[0].ui_tags.join(",") !==
      result.recommendation.cards[1].ui_tags.join(","),
    `${params.label}: Most Loved and Iconic should differ in emphasis`
  );

  if (params.preferences.discomfort_avoidance.includes("leather")) {
    const materials = result.recommendation.cards.flatMap((card) => [
      card.outfit_items.top.material ?? "",
      card.outfit_items.bottom.material ?? "",
      card.outfit_items.shoes.material ?? ""
    ]);
    assertCondition(
      materials.every((material) => material !== "leather"),
      `${params.label}: Disliked material should be avoided`
    );
  }
};

const run = async () => {
  await runCase({
    wardrobe: [
      ...wardrobeItems,
      { id: "bottom-1", category: "bottom", color: "navy", material: "denim", season: "all", condition: "good" },
      { id: "shoes-1", category: "shoes", color: "white", material: "canvas", season: "all", condition: "good" }
    ],
    preferences,
    label: "base"
  });

  await runCase({
    wardrobe: [
      { id: "top-2", category: "top", color: "white", material: "cotton", season: "all", condition: "good" },
      { id: "bottom-2", category: "bottom", color: "black", material: "leather", season: "all", condition: "good" },
      { id: "bottom-3", category: "bottom", color: "gray", material: "denim", season: "all", condition: "good" },
      { id: "shoes-2", category: "shoes", color: "black", material: "leather", season: "all", condition: "good" },
      { id: "shoes-3", category: "shoes", color: "white", material: "canvas", season: "all", condition: "good" }
    ],
    preferences: {
      ...preferences,
      discomfort_avoidance: ["leather"]
    },
    label: "dislikes"
  });

  await runCase({
    wardrobe: [
      { id: "top-4", category: "top", color: "beige", material: "linen", season: "all", condition: "good" },
      { id: "bottom-4", category: "bottom", color: "olive", material: "linen", season: "all", condition: "good" },
      { id: "shoes-4", category: "shoes", color: "tan", material: "leather", season: "all", condition: "good" },
      { id: "outer-1", category: "outer", color: "navy", material: "wool", season: "all", condition: "good" }
    ],
    preferences: {
      ...preferences,
      color_preference: "neutral",
      fit_preference: "relaxed"
    },
    label: "neutral-relaxed"
  });
};

run()
  .then(() => {
    console.log("recommendation.test.ts passed");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
