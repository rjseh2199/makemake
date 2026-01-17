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

export type GenderCategory = "male" | "female" | "non-binary";

export type ClimateType = "cold" | "temperate" | "hot" | "humid" | "dry";

export type Silhouette =
  | "slim"
  | "straight"
  | "oversized"
  | "mixed"
  | "tailored"
  | "structured"
  | "classic_relaxed"
  | "relaxed"
  | "fluid"
  | "workwear"
  | "precise"
  | "light_relaxed"
  | "comfortable_clean"
  | "classic";

export type PersonaPalette = {
  base: string[];
  accent?: string[];
};

export type PersonaRaw = {
  id: string;
  name: string;
  age: number;
  gender_category: string;
  occupation: string;
  culture_label?: string;
  city_culture?: string;
  climate_type: string;
  mobility_level: "low" | "medium" | "high";
  dresscode_level: 0 | 1 | 2 | 3;
  palette: PersonaPalette;
  silhouette: string;
  signature_items: string[];
  avoid_rules: string[];
  fabrics_bias?: string[];
  footwear_bias?: string[];
};

export type Persona = {
  id: string;
  name: string;
  age: number;
  gender_category: GenderCategory;
  occupation: string;
  city_culture: string;
  climate_type: ClimateType;
  mobility_level: "low" | "medium" | "high";
  dresscode_level: 0 | 1 | 2 | 3;
  palette: PersonaPalette;
  silhouette: Silhouette;
  signature_items: string[];
  avoid_rules: string[];
  fabrics_bias?: string[];
  footwear_bias?: string[];
  normalized: {
    silhouette: "slim" | "straight" | "oversized" | "mixed";
    footwear_bias: Array<"loafers" | "derbies" | "sneakers" | "boots" | "heels" | "sandals">;
    fabrics_bias: Array<"wool" | "linen" | "denim" | "tech" | "leather" | "cotton" | "silk">;
  };
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
