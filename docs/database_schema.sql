-- Final fixed schema (SQLite/Room compatible)
PRAGMA foreign_keys = ON;

CREATE TABLE sessions (
  session_id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 10),
  mode TEXT NOT NULL CHECK(mode IN ('BUSINESS', 'DEBATE', 'MIXED')),
  topic TEXT NOT NULL,
  context TEXT,
  goal TEXT,
  status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'COMPLETED')),
  conversation_summary TEXT
);

CREATE TABLE messages (
  msg_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'ai', 'system')),
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  assisted_by TEXT CHECK(assisted_by IS NULL OR assisted_by = 'OPTIONS'),
  FOREIGN KEY(session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE TABLE message_annotations (
  annotation_id TEXT PRIMARY KEY,
  msg_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('CLARIFY_PANEL')),
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(msg_id) REFERENCES messages(msg_id) ON DELETE CASCADE
);

CREATE TABLE feedbacks (
  session_id TEXT PRIMARY KEY,
  best_phrases_json TEXT NOT NULL,
  issues_json TEXT NOT NULL,
  next_objective TEXT NOT NULL,
  drill_json TEXT NOT NULL,
  FOREIGN KEY(session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE TABLE user_patterns (
  tag TEXT PRIMARY KEY,
  count INTEGER NOT NULL CHECK(count >= 0),
  last_seen_at INTEGER NOT NULL,
  examples_json TEXT NOT NULL
);

CREATE TABLE phrase_library (
  phrase_id TEXT PRIMARY KEY,
  phrase TEXT NOT NULL,
  meaning TEXT NOT NULL,
  alternative TEXT NOT NULL,
  saved_at INTEGER NOT NULL,
  source_session_id TEXT,
  FOREIGN KEY(source_session_id) REFERENCES sessions(session_id) ON DELETE SET NULL
);

CREATE INDEX idx_sessions_status_updated ON sessions(status, updated_at DESC);
CREATE INDEX idx_messages_session_created ON messages(session_id, created_at);
CREATE INDEX idx_annotations_msg ON message_annotations(msg_id);
CREATE INDEX idx_feedbacks_session ON feedbacks(session_id);
CREATE INDEX idx_phrase_library_saved_at ON phrase_library(saved_at DESC);
