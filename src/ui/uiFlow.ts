export type ScreenId =
  | "start"
  | "daily-intent"
  | "weekly-intent"
  | "style-quiz"
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
    id: "start",
    title: "시작",
    description: "첫 실행 시 의도 선택 화면.",
    elements: [
      { type: "hero", title: "오늘 뭐 입지?", subtitle: "가장 빠른 시작" },
      { type: "cta", label: "오늘/내일 추천", action: "open-daily-intent" },
      { type: "cta", label: "주간 추천 만들기", action: "open-weekly-intent" },
      { type: "cta", label: "스타일 발견(2분)", action: "open-style-quiz" }
    ],
    next: ["daily-intent", "weekly-intent", "style-quiz"]
  },
  {
    id: "daily-intent",
    title: "오늘/내일 추천",
    description: "최소 질문으로 바로 추천.",
    elements: [
      { type: "card", title: "기분/상황", description: "오늘의 무드" },
      { type: "card", title: "불편한 요소", description: "피하고 싶은 것" },
      { type: "cta", label: "추천 보기", action: "show-daily-result" }
    ],
    next: ["home"]
  },
  {
    id: "weekly-intent",
    title: "주간 추천",
    description: "이번 주 상황에 맞춘 추천.",
    elements: [
      { type: "card", title: "주간 무드", description: "전체 분위기" },
      { type: "card", title: "주요 상황", description: "일/데이트/행사" },
      { type: "cta", label: "주간 추천 보기", action: "show-weekly-result" }
    ],
    next: ["weekly-recommendation"]
  },
  {
    id: "style-quiz",
    title: "스타일 발견",
    description: "6문항 이내로 선호도를 파악.",
    elements: [
      { type: "list", title: "질문", items: ["무드", "싫은 요소", "상황", "컬러", "핏"] },
      { type: "cta", label: "퀴즈 완료", action: "finish-quiz" }
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
