export type WeatherSummary = {
  region: string;
  startDate: string;
  endDate: string;
  temperatureRangeC: [number, number];
  precipitationChance: number;
  source: "kma-short-term" | "kma-neighborhood";
  notes?: string;
};

export type WardrobeItem = {
  id: string;
  category: "top" | "bottom" | "outer" | "shoes" | "accessory";
  color: string;
  season: "spring" | "summer" | "fall" | "winter" | "all";
  lastWornDate?: string;
  condition: "new" | "good" | "worn" | "retire";
};

export type OutfitHistoryEntry = {
  date: string;
  outfitItemIds: string[];
  rating?: number;
  notes?: string;
};

export type ScheduleEntry = {
  date: string;
  title: string;
  location?: string;
  formality?: "casual" | "smart-casual" | "formal";
  mood?: string;
};

export type StyleIntent = {
  level: "minimal" | "balanced" | "maximal";
  desiredVibes: Array<"cyworld" | "arcade-90s" | "arcade-00s">;
  keywords: string[];
  emotions: string[];
};

export type ScheduleSummary = {
  totalEvents: number;
  dateCount: number;
  locations: string[];
  formalityCounts: Record<"casual" | "smart-casual" | "formal", number>;
  notableEvents: string[];
};

export type LifestyleContext = {
  schedule: ScheduleSummary;
  moodSignals: string[];
  keywords: string[];
  effortLevel: StyleIntent["level"];
  desiredVibes: StyleIntent["desiredVibes"];
};

export type ConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

export type FeedbackEntry = {
  date: string;
  feedback: string;
  mood?: string;
  tags?: string[];
};

export type Recommendation = {
  weekOf: string;
  outfits: Array<{
    day: string;
    items: WardrobeItem[];
    mood: string;
    vibe: "cyworld" | "arcade-90s" | "arcade-00s";
    colorPalette: string[];
    materials: string[];
    accessories: string[];
    notes: string;
  }>;
  missingItems: Array<{
    category: WardrobeItem["category"];
    reason: string;
  }>;
  highlights: string[];
};

export type AgentContext = {
  apiKey: string;
  model: string;
  region: string;
  currentDate: string;
  locationConsent: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
};

export type LocalDataSnapshot = {
  wardrobeItems: WardrobeItem[];
  history: OutfitHistoryEntry[];
  feedback: FeedbackEntry[];
  schedule: ScheduleEntry[];
  conversation: ConversationTurn[];
};

export type ValidationIssue = {
  severity: "info" | "warning" | "error";
  message: string;
};
