export type ScreenId =
  | "onboarding"
  | "home"
  | "weekly-recommendation"
  | "daily-feedback"
  | "wardrobe"
  | "shopping"
  | "share";

export type ScreenElement =
  | { type: "hero"; title: string; subtitle?: string }
  | { type: "card"; title: string; description?: string }
  | { type: "list"; title: string; items: string[] }
  | { type: "cta"; label: string; action: string }
  | { type: "visual"; description: string };

export type ScreenDefinition = {
  id: ScreenId;
  title: string;
  description: string;
  elements: ScreenElement[];
  next?: ScreenId[];
};

export const uiFlow: ScreenDefinition[] = [
  {
    id: "onboarding",
    title: "온보딩",
    description: "설정/취향/보유 옷/알림을 수집하는 초기 흐름.",
    elements: [
      { type: "hero", title: "패션 집사 시작하기", subtitle: "미니미와 함께" },
      { type: "card", title: "API 키/모델 설정", description: "초기 설정 후 수정 가능" },
      { type: "card", title: "위치 동의", description: "동네예보 기반 추천" },
      { type: "card", title: "보유 옷 등록", description: "카테고리/색/소재" },
      { type: "card", title: "취향/무드 선택", description: "싸이월드/90s/00s" },
      { type: "card", title: "알림 설정", description: "프로모션/추천 알림" }
    ],
    next: ["home"]
  },
  {
    id: "home",
    title: "홈",
    description: "미니미 캐릭터 + 오늘 추천 요약.",
    elements: [
      { type: "visual", description: "미니미 + 배경 테마" },
      { type: "card", title: "오늘의 추천 룩", description: "일정/감정/대화 컨텍스트 반영" },
      { type: "cta", label: "피드백 남기기", action: "open-feedback" }
    ],
    next: ["daily-feedback", "weekly-recommendation"]
  },
  {
    id: "weekly-recommendation",
    title: "주간 추천",
    description: "주간 코디 + 팔레트/소재/소품 요약.",
    elements: [
      { type: "list", title: "주간 룩", items: ["월~일 코디 카드"] },
      { type: "card", title: "무드/감정", description: "대화 기반 intent" },
      { type: "card", title: "팔레트/소재/소품", description: "맥시멀 감성" }
    ],
    next: ["shopping", "share"]
  },
  {
    id: "daily-feedback",
    title: "일일 피드백",
    description: "오늘 룩 만족도와 감정 기록.",
    elements: [
      { type: "card", title: "오늘의 느낌", description: "키워드/감정" },
      { type: "cta", label: "기록 저장", action: "save-feedback" }
    ],
    next: ["home"]
  },
  {
    id: "wardrobe",
    title: "보유 옷 관리",
    description: "보유 옷 등록/수정/상태 관리.",
    elements: [
      { type: "list", title: "보유 옷", items: ["카테고리 필터"] },
      { type: "card", title: "오래된 옷", description: "교체 추천" }
    ],
    next: ["shopping"]
  },
  {
    id: "shopping",
    title: "쇼핑/프로모션",
    description: "부족 아이템과 제휴 상품 추천.",
    elements: [
      { type: "list", title: "추천 아이템", items: ["제휴 상품"] },
      { type: "card", title: "가격 알림", description: "할인/프로모션" }
    ],
    next: ["share"]
  },
  {
    id: "share",
    title: "공유",
    description: "추천 vs 실제 착용 비교 카드.",
    elements: [
      { type: "visual", description: "스토리용 카드" },
      { type: "cta", label: "SNS 공유", action: "share-story" }
    ],
    next: ["home"]
  }
];
