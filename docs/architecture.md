# Architecture Blueprint (MVVM, local-first)

## 1) Layered architecture

### Presentation (Compose + ViewModel)
- Screens:
  - HomeScreen
  - SettingsScreen
  - TopicSetupScreen
  - ChatScreen
  - FeedbackScreen
  - HistoryScreen
- 각 Screen은 단일 ViewModel에 바인딩
- ViewModel은 immutable `UiState` + `onAction(...)` 이벤트 진입점만 노출

### Domain (UseCase)
- StartSessionUseCase
- ResumeActiveSessionUseCase
- SendMessageUseCase
- ApplyControlActionUseCase (Easier/Deeper/Clarify/Options)
- EndSessionAndGenerateFeedbackUseCase
- SaveFeedbackPhraseToLibraryUseCase
- ListSessionsUseCase
- RolloverSessionOnMaxTurnsUseCase (30턴 정책)

### Data
- Room: sessions/messages/message_annotations/feedbacks/user_patterns/phrase_library
- DataStore: 비밀이 아닌 설정
- Keystore-backed encrypted storage: API Key
- LLM Provider adapter: OkHttp 기반

## 2) Cross-cutting rules
- 로컬 퍼스트: 모든 원문 transcript/feedback는 Room에 저장
- 대화 중 교정 금지: chat 단계에서는 correction 프롬프트/응답 금지
- autosave: user/ai/system 메시지 생성 즉시 트랜잭션 저장
- provider/model UI 노출 금지: OPENAI + DEFAULT_MODEL 상수 사용

## 3) Detailed state flows

### Home
1. `GetActiveSession()` 호출
2. ACTIVE 존재 시 Resume 버튼 노출
3. 없으면 Start Session만 노출

### Start Session
1. level/mode/topic/context/goal 검증
2. `sessions(status=ACTIVE)` insert
3. ChatScreen으로 이동

### Send message (autosave)
1. user message insert (`assisted_by`는 NULL 또는 OPTIONS)
2. session.updated_at 갱신
3. transcript 로드 후 provider.chat 요청
4. ai message insert
5. session.updated_at 재갱신
6. user turn count == 30이면 rollover 트리거

### Clarify
1. 직전 ai message 조회
2. provider에 단순화 요청
3. `message_annotations(type=CLARIFY_PANEL)` insert
4. 해당 ai bubble 하단 패널 렌더

### Options
1. provider에 3개 톤(Soft/Neutral/Firm) 생성 요청
2. Bottom Sheet 표시
3. 선택 문장을 입력창에 주입
4. 실제 전송 시 해당 user message를 `assisted_by=OPTIONS`로 저장

### End & Feedback
1. 현재 transcript로 feedback 생성 요청
2. feedback 구조(3/2/1/3) 검증
3. `feedbacks` upsert
4. session.status를 `COMPLETED`로 변경

### 30-turn rollover
1. ACTIVE 세션 user role 메시지 수 카운트
2. 30 도달 즉시 system notice insert
3. 기존 세션은 기록 보존을 위해 그대로 유지한다 (`COMPLETED`로 바꾸지 않음)
4. 동일 topic/context/goal + same level/mode로 새 `ACTIVE` 세션 생성
5. Chat VM의 current session pointer를 신규 session_id로 스위치
6. Home의 Resume는 `updated_at DESC` 기준 첫 ACTIVE 세션을 연다

## 4) Error handling policy
- API Key 없음: Settings로 유도 + 전송 차단
- Test Connection 실패: 저장은 가능하되 상태 배지로 실패 표시
- provider timeout: 재시도 CTA 노출, 기존 autosave 데이터 유지

## 5) Suggested package layout
- `feature/home`, `feature/settings`, `feature/topic`, `feature/chat`, `feature/feedback`, `feature/history`
- `domain/usecase/*`
- `data/local/room/*`, `data/local/datastore/*`, `data/security/*`, `data/remote/provider/*`

## 6) Implementation done criteria
- Acceptance checklist 전 항목 수동 테스트 통과
- Room schema와 문서 스키마 일치
- process death 후 ACTIVE 세션 복원 확인
