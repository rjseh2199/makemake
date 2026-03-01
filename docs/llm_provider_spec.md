# LLM Provider Spec

## 1) Interface contract

```kotlin
interface LlmProvider {
    suspend fun chat(request: ChatRequest): ChatResponse
    suspend fun testConnection(apiKey: String): ConnectionResult
}
```

### Fixed implementations (v1)
- `MockProvider` (테스트/개발)
- `OpenAIProvider` (실사용)

## 2) Settings exposure policy
- Settings 화면에서 Provider/Model 선택 UI는 제공하지 않음
- 내부 상수:
  - `provider = OPENAI`
  - `model = DEFAULT_MODEL`

## 3) Chat request/response shape (recommended)

```kotlin
data class ChatRequest(
    val systemPrompt: String,
    val messages: List<ChatMessage>,
    val level: Int,
    val mode: String,
    val topic: String
)

data class ChatMessage(
    val role: String, // user | ai | system
    val content: String
)

data class ChatResponse(
    val text: String
)
```

## 4) System prompt constraints (must include)
1. `No corrections during chat. Feedback only after session.`
2. `Short, snappy. Prefer 1–3 sentences. Max 5.`
3. `Ask exactly ONE question at the end.`
4. Keep output aligned to level/mode/topic.

## 5) Feature-specific prompt contracts

### Clarify
- Input: previous AI response
- Output: easier English explanation
- Storage: `message_annotations(type=CLARIFY_PANEL)`
- Rendering: same AI bubble 하단 패널 (새 bubble 금지)

### Options
- Input: recent context + user intent
- Output: exactly 3 variants with labels `Soft`, `Neutral`, `Firm`
- Rendering: bottom sheet
- Persistence: 사용자가 실제 전송한 경우에만 `assisted_by=OPTIONS`

### Feedback
- Trigger: End & Feedback only
- Output schema:
  - best_phrases: 3 items (each includes alternative)
  - repeated_issues: 2 items
  - next_objective: 1 item
  - mini_drill: 3 items

## 6) Test Connection behavior
- API key 유효성 검사 전용 호출
- 성공: connected 상태 저장
- 실패: 오류 메시지 표시(키 저장 자체는 허용 가능)

## 7) Runtime safety checks
- 응답 문장 수가 5를 초과하면 앱에서 soft-trim/재요청 전략 중 하나를 선택
- 마지막 문장 질문 수가 1개가 아니면 재요청 가능
- 단, 정책 위반 시에도 원문 로그는 그대로 저장(디버깅 목적)
