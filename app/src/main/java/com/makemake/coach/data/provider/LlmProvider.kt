package com.makemake.coach.data.provider

interface LlmProvider {
    suspend fun chat(request: ChatRequest): ChatResponse
    suspend fun testConnection(apiKey: String): Result<Unit>
}

data class ChatRequest(
    val systemPrompt: String,
    val messages: List<ChatMessage>,
    val level: Int,
    val mode: String,
    val topic: String,
)

data class ChatMessage(
    val role: String,
    val content: String,
)

data class ChatResponse(
    val text: String,
)
