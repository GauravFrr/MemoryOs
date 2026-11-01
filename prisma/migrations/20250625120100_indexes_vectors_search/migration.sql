-- Add pgvector + full-text search columns on memories
ALTER TABLE "memories" ADD COLUMN IF NOT EXISTS "embedding" vector(1536);
ALTER TABLE "memories" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;
ALTER TABLE "memory_suggestions" ALTER COLUMN "confidence" SET DATA TYPE DECIMAL(3,2);
ALTER TABLE "memories" ALTER COLUMN "confidence" SET DATA TYPE DECIMAL(3,2);

-- Indexes from schema
CREATE INDEX IF NOT EXISTS "idx_conversations_user_id" ON "conversations"("user_id");
CREATE INDEX IF NOT EXISTS "idx_conversations_project_id" ON "conversations"("project_id");
CREATE INDEX IF NOT EXISTS "idx_conversations_platform" ON "conversations"("user_id", "platform");
CREATE INDEX IF NOT EXISTS "idx_conversations_started_at" ON "conversations"("user_id", "started_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_memories_user_id" ON "memories"("user_id");
CREATE INDEX IF NOT EXISTS "idx_memories_project_id" ON "memories"("project_id");
CREATE INDEX IF NOT EXISTS "idx_memories_type" ON "memories"("user_id", "type");
CREATE INDEX IF NOT EXISTS "idx_memories_status" ON "memories"("user_id", "status");
CREATE INDEX IF NOT EXISTS "idx_memories_score" ON "memories"("user_id", "score" DESC);
CREATE INDEX IF NOT EXISTS "idx_suggestions_user_pending" ON "memory_suggestions"("user_id", "status");
CREATE INDEX IF NOT EXISTS "idx_memory_tags_memory" ON "memory_tags"("memory_id");
CREATE INDEX IF NOT EXISTS "idx_memory_tags_tag" ON "memory_tags"("tag_id");
CREATE INDEX IF NOT EXISTS "idx_messages_conversation_id" ON "messages"("conversation_id");
CREATE INDEX IF NOT EXISTS "idx_messages_position" ON "messages"("conversation_id", "position");
CREATE INDEX IF NOT EXISTS "idx_projects_user_id" ON "projects"("user_id");
CREATE INDEX IF NOT EXISTS "idx_projects_status" ON "projects"("user_id", "status");
CREATE INDEX IF NOT EXISTS "idx_subscriptions_user_id" ON "subscriptions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_sync_queue_pending" ON "sync_queue"("user_id", "status", "created_at");
CREATE INDEX IF NOT EXISTS "idx_usage_logs_user_period" ON "usage_logs"("user_id", "period");
CREATE INDEX IF NOT EXISTS "idx_usage_logs_action" ON "usage_logs"("user_id", "action", "period");

-- Full-text search trigger (docs/05-BACKEND-SCHEMA.md)
CREATE OR REPLACE FUNCTION update_memory_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = to_tsvector('english',
    COALESCE(NEW.content, '') || ' ' ||
    COALESCE(NEW.structured_data::text, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_memories_search ON memories;
CREATE TRIGGER trg_memories_search
  BEFORE INSERT OR UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION update_memory_search_vector();

-- GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_memories_search ON memories USING gin(search_vector);

-- HNSW index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_memories_embedding
  ON memories USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Backfill search_vector for existing rows
UPDATE memories
SET search_vector = to_tsvector('english',
  COALESCE(content, '') || ' ' || COALESCE(structured_data::text, '')
)
WHERE search_vector IS NULL;
