package com.makemake.coach.data

import com.makemake.coach.data.local.AppDao
import com.makemake.coach.data.local.FeedbackEntity
import com.makemake.coach.data.local.MessageAnnotationEntity
import com.makemake.coach.data.local.MessageEntity
import com.makemake.coach.data.local.PhraseLibraryEntity
import com.makemake.coach.data.local.SessionEntity
import com.makemake.coach.data.provider.ChatMessage
import com.makemake.coach.data.provider.ChatRequest
import com.makemake.coach.data.provider.LlmProvider
import java.util.UUID

class CoachRepository(
    private val dao: AppDao,
    private val provider: LlmProvider,
) {
    data class SendResult(val sessionIdToContinue: String)
    data class ClarifyResult(val msgId: String, val content: String)

    fun observeLatestActiveSession() = dao.observeLatestActiveSession()
    fun observeSessions() = dao.observeSessions()
    fun observeMessages(sessionId: String) = dao.observeMessages(sessionId)
    fun observeFeedback(sessionId: String) = dao.observeFeedback(sessionId)

    suspend fun startSession(level: Int, mode: String, topic: String, context: String?, goal: String?): String {
        val now = System.currentTimeMillis()
        val id = UUID.randomUUID().toString()
        dao.upsertSession(
            SessionEntity(
                session_id = id,
                created_at = now,
                updated_at = now,
                level = level.coerceIn(1, 10),
                mode = mode,
                topic = topic,
                context = context,
                goal = goal,
                status = "ACTIVE",
            )
        )
        return id
    }

    suspend fun sendMessage(
        sessionId: String,
        content: String,
        assistedBy: String? = null,
        easierTurns: Int = 0,
        deeperTurns: Int = 0,
    ): SendResult {
        val now = System.currentTimeMillis()
        dao.insertMessage(
            MessageEntity(
                msg_id = UUID.randomUUID().toString(),
                session_id = sessionId,
                role = "user",
                content = content,
                created_at = now,
                assisted_by = assistedBy,
            )
        )
        touchSession(sessionId, now)

        val session = dao.getSession(sessionId) ?: return SendResult(sessionId)
        val response = provider.chat(
            ChatRequest(
                systemPrompt = buildSystemPrompt(easierTurns, deeperTurns),
                messages = listOf(ChatMessage("user", content)),
                level = session.level,
                mode = session.mode,
                topic = session.topic,
            )
        )

        dao.insertMessage(
            MessageEntity(
                msg_id = UUID.randomUUID().toString(),
                session_id = sessionId,
                role = "ai",
                content = response.text,
                created_at = System.currentTimeMillis(),
            )
        )
        touchSession(sessionId, System.currentTimeMillis())

        return maybeRollover(session)
    }

    private fun buildSystemPrompt(easierTurns: Int, deeperTurns: Int): String {
        val ease = if (easierTurns > 0) "Use simpler English for this turn." else ""
        val deep = if (deeperTurns > 0) "Increase debate depth for this turn." else ""
        return "No corrections during chat. Feedback only after session. Short, snappy. Prefer 1-3 sentences. Max 5. Ask exactly ONE question at the end. $ease $deep".trim()
    }

    private suspend fun maybeRollover(session: SessionEntity): SendResult {
        val count = dao.getUserTurnCount(session.session_id)
        if (count < 30) return SendResult(session.session_id)

        dao.insertMessage(
            MessageEntity(
                msg_id = UUID.randomUUID().toString(),
                session_id = session.session_id,
                role = "system",
                content = "This session reached 30 turns. A new active session has started with the same topic.",
                created_at = System.currentTimeMillis(),
            )
        )

        val newSessionId = startSession(
            level = session.level,
            mode = session.mode,
            topic = session.topic,
            context = session.context,
            goal = session.goal,
        )
        return SendResult(newSessionId)
    }

    suspend fun clarifyLastAiMessage(sessionId: String): ClarifyResult? {
        val last = dao.getLastAiMessage(sessionId) ?: return null
        val content = "In simple English: ${last.content.take(200)}"
        dao.insertAnnotation(
            MessageAnnotationEntity(
                annotation_id = UUID.randomUUID().toString(),
                msg_id = last.msg_id,
                type = "CLARIFY_PANEL",
                content = content,
                created_at = System.currentTimeMillis(),
            )
        )
        return ClarifyResult(last.msg_id, content)
    }

    suspend fun endAndCreateFeedback(sessionId: String) {
        dao.upsertFeedback(
            FeedbackEntity(
                session_id = sessionId,
                best_phrases_json = "[\"phrase1\",\"phrase2\",\"phrase3\"]",
                issues_json = "[\"issue1\",\"issue2\"]",
                next_objective = "Use one concise argument and one example.",
                drill_json = "[\"q1\",\"q2\",\"q3\"]",
            )
        )
        dao.markCompleted(sessionId, System.currentTimeMillis())
    }

    suspend fun savePhrase(sessionId: String, phrase: String, alternative: String) {
        dao.insertPhrase(
            PhraseLibraryEntity(
                phrase_id = UUID.randomUUID().toString(),
                phrase = phrase,
                meaning = "Saved from feedback",
                alternative = alternative,
                saved_at = System.currentTimeMillis(),
                source_session_id = sessionId,
            )
        )
    }

    suspend fun testConnection(apiKey: String): Result<Unit> = provider.testConnection(apiKey)

    private suspend fun touchSession(sessionId: String, time: Long) {
        val current = dao.getSession(sessionId) ?: return
        dao.upsertSession(current.copy(updated_at = time))
    }
}
