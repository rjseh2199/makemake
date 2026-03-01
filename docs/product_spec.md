# Product Spec (Locked v1)

## 1) Product Definition
- Android 텍스트 기반 영어 대화 코치 앱
- 레벨: 1~10
- 모드: Business / Debate / Mixed
- 대화 중 교정 없음, 세션 종료 후 피드백만 제공
- 전부 로컬 저장 (서버 없음, 로그인 없음)

## 2) Technology Stack
- Android: Kotlin + Jetpack Compose
- Architecture: MVVM
- Local DB: Room(SQLite)
- Settings 저장: DataStore
- API Key 저장: Android Keystore 기반 암호화 저장
- LLM 호출: 앱에서 직접 HTTP 호출(OkHttp)

## 3) Screens (6 fixed)

### 3.1 Home
- Level slider(1~10, default 5)
- Mode selector: Business / Debate / Mixed (default Mixed)
- Buttons:
  - Start Session
  - Resume last session (ACTIVE 세션 있을 때만 노출)
- 우상단 gear 아이콘: Settings 이동

### 3.2 Settings (Required)
- Provider: OPENAI 고정 (UI 선택 불가)
- Model: DEFAULT_MODEL 고정 (UI 선택 불가)
- API Key input (masked)
- Save button
- Test Connection button (키 유효성 체크)
- System prompt language: English 고정

### 3.3 Topic Setup
- Topic (required)
- Context (optional)
- Goal (optional)
- 추천 카드 탭: Business / Debate
  - 카드 탭 시 Topic 자동 입력
- Begin Chat

### 3.4 Chat
- Message list + input + Send
- Header: level/mode/topic
- 컨트롤 4개 고정:
  - Easier: 다음 3턴 동안 난이도 1단계 하향
  - Deeper: 다음 3턴 동안 토론 강도 1단계 상향
  - Clarify: 직전 AI 답변을 쉬운 영어로 재설명
  - Options: 사용자 답변 3개 제안
- End & Feedback

### 3.5 Feedback
고정 포맷:
- Best phrases 3개 (각 대체 표현 1개)
- My repeated issues 2개 ("uncertain" 허용)
- Next objective 1개
- Mini drill 3문항
- Save to Library
- Retry same topic

### 3.6 History / Library
- 세션 목록: date/topic/mode/level
- ACTIVE 세션은 상단 In progress로 고정
- 세션 상세: transcript + feedback

## 4) UX Rules (fixed)

### 4.1 Clarify rendering
- 새로운 chat bubble 추가 금지
- 직전 AI 메시지 아래 Expandable Card로 렌더
- DB 저장: `message_annotations` with type=`CLARIFY_PANEL`

### 4.2 Options rendering
- Options 버튼 클릭 시 Bottom Sheet 오픈
- 3개 문장 제공: Soft / Neutral / Firm
- 탭하면 입력창에 채우기(사용자 수정 가능)
- 최종 전송된 user message는 `assisted_by = "OPTIONS"`

### 4.3 assisted_ratio removed
- assisted_ratio 등 비율 계산 제거
- 허용 값:
  - `assisted_by = NULL`
  - `assisted_by = "OPTIONS"`

## 5) Session resume / process death
- send/receive 마다 Room 즉시 저장(autosave)
- `sessions.status`
  - ACTIVE: End & Feedback 이전
  - COMPLETED: feedback 생성/저장 이후
- Home: ACTIVE 존재 시 Resume 버튼 표시
- History: ACTIVE 세션 상단 고정

## 6) Level output constraints (1~10)
최우선 원칙: 짧고 빠른 핑퐁
- 1~3문장 권장, 최대 5문장
- 마지막 문장에 질문 정확히 1개
- 레벨별 문장 길이는 권장치(엄격 강제 아님)

UI safety:
- AI 버블이 8줄 초과 시 "더보기"로 접기

## 7) Context length policy
- 세션당 최대 user turn 30회
- 30회 도달 시:
  - 시스템 안내 메시지 추가
  - 동일 topic/context/goal로 ACTIVE 세션 자동 생성
  - 사용자는 끊김 없이 새 세션에서 이어서 대화
  - 기존 세션은 기록 보존을 위해 유지되며, Home의 Resume는 `updated_at` 기준 최신 ACTIVE를 연다
- `conversation_summary` 필드는 초기 버전에서 NULL 유지

## 8) Canonical constants (implementation contract)
아래 값은 문자열/상수 표기까지 고정한다.

- Modes: `BUSINESS`, `DEBATE`, `MIXED`
- Session status: `ACTIVE`, `COMPLETED`
- Message role: `user`, `ai`, `system`
- Annotation type: `CLARIFY_PANEL`
- Assisted marker: `OPTIONS` 또는 `NULL`
- Provider constant: `OPENAI`
- Model constant: `DEFAULT_MODEL`

## 9) Acceptance checklist (must-pass)
- Home에서 ACTIVE 없으면 Resume 숨김, 있으면 노출
- Clarify는 bubble이 아닌 패널로만 표시
- Options는 Bottom Sheet로만 표시되고 Soft/Neutral/Firm 정확히 3개
- Options 사용 후 전송 message의 `assisted_by` 값은 `OPTIONS`
- End & Feedback 이전 status는 ACTIVE, 완료 후 COMPLETED
- 30번째 user turn 직후 시스템 안내 + 새 ACTIVE 세션 생성
- Feedback 포맷 3/2/1/3 구조 유지
- Provider/Model UI 선택 없음(OPENAI/DEFAULT_MODEL 고정)

## 10) Final DB schema
`docs/database_schema.sql`을 단일 소스로 사용한다.

## 11) LLM provider direction
- Provider interface는 유지(향후 교체 가능성)
- 구현체 2개:
  - `MockProvider`
  - `OpenAIProvider`
- 고정 system-prompt 규칙:
  - System prompt in English
  - “No corrections during chat. Feedback only after session.”
  - “Short, snappy. Prefer 1–3 sentences. Max 5.”
  - “Ask exactly ONE question at the end.”
