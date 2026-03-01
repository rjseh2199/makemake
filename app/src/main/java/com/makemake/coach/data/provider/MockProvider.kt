package com.makemake.coach.data.provider

class MockProvider : LlmProvider {
    override suspend fun chat(request: ChatRequest): ChatResponse {
        val userText = request.messages.lastOrNull { it.role == "user" }?.content.orEmpty()
        return ChatResponse(
            text = "Great point about ${request.topic}. Let's keep it concise. Could you expand that in one example?"
        )
    }

    override suspend fun testConnection(apiKey: String): Result<Unit> {
        return if (apiKey.isNotBlank()) Result.success(Unit) else Result.failure(IllegalArgumentException("API Key is empty"))
    }
}
