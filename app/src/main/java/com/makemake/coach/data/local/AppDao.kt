package com.makemake.coach.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import kotlinx.coroutines.flow.Flow

@Dao
interface AppDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertSession(session: SessionEntity)

    @Query("SELECT * FROM sessions WHERE status = 'ACTIVE' ORDER BY updated_at DESC LIMIT 1")
    fun observeLatestActiveSession(): Flow<SessionEntity?>

    @Query("SELECT * FROM sessions WHERE status = 'ACTIVE' ORDER BY updated_at DESC LIMIT 1")
    suspend fun getLatestActiveSession(): SessionEntity?

    @Query("SELECT * FROM sessions ORDER BY CASE WHEN status = 'ACTIVE' THEN 0 ELSE 1 END, updated_at DESC")
    fun observeSessions(): Flow<List<SessionEntity>>

    @Query("SELECT * FROM sessions WHERE session_id = :sessionId LIMIT 1")
    suspend fun getSession(sessionId: String): SessionEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: MessageEntity)

    @Query("SELECT * FROM messages WHERE session_id = :sessionId ORDER BY created_at ASC")
    fun observeMessages(sessionId: String): Flow<List<MessageEntity>>

    @Query("SELECT COUNT(*) FROM messages WHERE session_id = :sessionId AND role = 'user'")
    suspend fun getUserTurnCount(sessionId: String): Int

    @Query("SELECT * FROM messages WHERE session_id = :sessionId AND role = 'ai' ORDER BY created_at DESC LIMIT 1")
    suspend fun getLastAiMessage(sessionId: String): MessageEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAnnotation(annotation: MessageAnnotationEntity)

    @Query("SELECT * FROM message_annotations WHERE msg_id = :msgId AND type = 'CLARIFY_PANEL' ORDER BY created_at DESC LIMIT 1")
    fun observeClarifyAnnotation(msgId: String): Flow<MessageAnnotationEntity?>

    @Query("SELECT * FROM message_annotations WHERE msg_id = :msgId AND type = 'CLARIFY_PANEL' ORDER BY created_at DESC LIMIT 1")
    suspend fun getLatestClarifyAnnotation(msgId: String): MessageAnnotationEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertFeedback(feedback: FeedbackEntity)

    @Query("SELECT * FROM feedbacks WHERE session_id = :sessionId")
    fun observeFeedback(sessionId: String): Flow<FeedbackEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPhrase(phrase: PhraseLibraryEntity)

    @Transaction
    suspend fun markCompleted(sessionId: String, now: Long) {
        val current = getSession(sessionId) ?: return
        upsertSession(current.copy(status = "COMPLETED", updated_at = now))
    }
}
