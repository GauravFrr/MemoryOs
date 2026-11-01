import "dotenv/config";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { getRedisUrl, QUEUE_NAMES } from "@memoryos/queue";
import {
  startWindowsRedis,
  stopWindowsRedis,
} from "./lib/redis-windows";

const QUEUE_LIST = [QUEUE_NAMES.MEMORY_EXTRACTION, QUEUE_NAMES.EMBEDDINGS] as const;

function parseRedisUrl(url: string): { host: string; port: number } {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
  };
}

async function pingRedis(url: string): Promise<string> {
  const client = new IORedis(url, {
    maxRetriesPerRequest: null,
    connectTimeout: 5000,
    lazyConnect: true,
  });

  try {
    await client.connect();
    await client.ping();
    const info = await client.info("server");
    const versionMatch = info.match(/redis_version:([^\r\n]+)/);
    return versionMatch?.[1]?.trim() ?? "unknown";
  } finally {
    await client.quit();
  }
}

function parseMajorVersion(version: string): number {
  return Number.parseInt(version.split(".")[0] ?? "0", 10);
}

async function verifyQueues() {
  let redisUrl = getRedisUrl();
  let managedProcess: Awaited<ReturnType<typeof startWindowsRedis>> | null =
    null;

  console.log(`Connecting to Redis at ${redisUrl}...`);

  let version = "unknown";

  try {
    version = await pingRedis(redisUrl);
    console.log(`Redis ping: OK (version ${version})`);
  } catch {
    const isLocal =
      redisUrl.includes("localhost") || redisUrl.includes("127.0.0.1");

    if (!isLocal) {
      throw new Error(`Could not connect to Redis at ${redisUrl}`);
    }

    if (process.platform === "win32") {
      console.log("Starting local Redis 5.0.14 for Windows...");
      managedProcess = await startWindowsRedis(6379);
      redisUrl = managedProcess.url;
      version = await pingRedis(redisUrl);
      console.log(`Redis ping: OK (version ${version})`);
    } else {
      throw new Error(
        "Local Redis is not running. Start it with: docker compose up redis",
      );
    }
  }

  if (parseMajorVersion(version) < 5) {
    throw new Error(
      `Redis ${version} is too old for BullMQ (requires 5.0+). Set REDIS_URL to Redis 5+ (Docker, Railway, or Upstash).`,
    );
  }

  const { host, port } = parseRedisUrl(redisUrl);
  const connectionOptions = {
    host,
    port,
    maxRetriesPerRequest: null,
  };

  const queues: Queue[] = [];

  for (const name of QUEUE_LIST) {
    const queue = new Queue(name, { connection: connectionOptions });
    queues.push(queue);

    const counts = await queue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed",
    );

    console.log(`Queue "${name}": connected`);
    console.log(
      `  waiting=${counts.waiting} active=${counts.active} completed=${counts.completed} failed=${counts.failed} delayed=${counts.delayed}`,
    );
  }

  for (const queue of queues) {
    await queue.close();
  }

  if (managedProcess) {
    await stopWindowsRedis(managedProcess.process);
  }

  console.log("\nAll BullMQ queues verified successfully.");
}

verifyQueues().catch((error) => {
  console.error("Queue verification failed:", error);
  process.exit(1);
});
