export const QUEUE_NAMES = {
  MEMORY_EXTRACTION: "memory-extraction",
  EMBEDDINGS: "embeddings",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export function getRedisUrl(): string {
  return process.env.REDIS_URL ?? "redis://localhost:6379";
}
