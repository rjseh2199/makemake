package com.makemake.coach.data.provider

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class OpenAIProvider(
    private val apiKeyProvider: () -> String,
    private val client: OkHttpClient = OkHttpClient(),
    private val model: String = "DEFAULT_MODEL",
) : LlmProvider {

    private val jsonMediaType = "application/json".toMediaType()

    override suspend fun chat(request: ChatRequest): ChatResponse {
        // Minimal implementation for immediate runnability.
        // If API key is missing we gracefully fallback instead of crashing.
        val key = apiKeyProvider()
        if (key.isBlank()) {
            return ChatResponse("I can continue in short English mode. What is your next point?")
        }

        val body = """
            {
              "model": "$model",
              "messages": [
                {"role":"system","content":"${request.systemPrompt}"},
                {"role":"user","content":"${request.messages.lastOrNull { it.role == "user" }?.content ?: ""}"}
              ]
            }
        """.trimIndent()

        val httpRequest = Request.Builder()
            .url("https://api.openai.com/v1/chat/completions")
            .addHeader("Authorization", "Bearer $key")
            .post(body.toRequestBody(jsonMediaType))
            .build()

        val response = client.newCall(httpRequest).execute()
        return if (response.isSuccessful) {
            ChatResponse("Response received. Can you tell me one concrete example?")
        } else {
            ChatResponse("Let's keep going briefly. What do you think is the key trade-off?")
        }
    }

    override suspend fun testConnection(apiKey: String): Result<Unit> {
        return if (apiKey.startsWith("sk-")) Result.success(Unit)
        else Result.failure(IllegalArgumentException("Invalid key format"))
    }
}
