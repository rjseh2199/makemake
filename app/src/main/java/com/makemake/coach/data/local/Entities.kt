package com.makemake.coach.data.local

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "sessions", indices = [Index(value = ["status", "updated_at"])])
data class SessionEntity(
    @PrimaryKey val session_id: String,
    val created_at: Long,
    val updated_at: Long,
    val level: Int,
    val mode: String,
    val topic: String,
    val context: String?,
    val goal: String?,
    val status: String,
    val conversation_summary: String? = null,
)

@Entity(
    tableName = "messages",
    foreignKeys = [ForeignKey(
        entity = SessionEntity::class,
        parentColumns = ["session_id"],
        childColumns = ["session_id"],
        onDelete = ForeignKey.CASCADE
    )],
    indices = [Index(value = ["session_id", "created_at"])]
)
data class MessageEntity(
    @PrimaryKey val msg_id: String,
    val session_id: String,
    val role: String,
    val content: String,
    val created_at: Long,
    val assisted_by: String? = null,
)

@Entity(
    tableName = "message_annotations",
    foreignKeys = [ForeignKey(
        entity = MessageEntity::class,
        parentColumns = ["msg_id"],
        childColumns = ["msg_id"],
        onDelete = ForeignKey.CASCADE
    )],
    indices = [Index(value = ["msg_id"])]
)
data class MessageAnnotationEntity(
    @PrimaryKey val annotation_id: String,
    val msg_id: String,
    val type: String,
    val content: String,
    val created_at: Long,
)

@Entity(
    tableName = "feedbacks",
    foreignKeys = [ForeignKey(
        entity = SessionEntity::class,
        parentColumns = ["session_id"],
        childColumns = ["session_id"],
        onDelete = ForeignKey.CASCADE
    )]
)
data class FeedbackEntity(
    @PrimaryKey val session_id: String,
    val best_phrases_json: String,
    val issues_json: String,
    val next_objective: String,
    val drill_json: String,
)

@Entity(tableName = "user_patterns")
data class UserPatternEntity(
    @PrimaryKey val tag: String,
    val count: Int,
    val last_seen_at: Long,
    val examples_json: String,
)

@Entity(tableName = "phrase_library")
data class PhraseLibraryEntity(
    @PrimaryKey val phrase_id: String,
    val phrase: String,
    val meaning: String,
    val alternative: String,
    val saved_at: Long,
    val source_session_id: String?,
)
