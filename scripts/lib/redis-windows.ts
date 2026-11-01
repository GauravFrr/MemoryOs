import { spawn, type ChildProcess } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const REDIS_WINDOWS_URL =
  "https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip";

const CACHE_DIR = join(process.cwd(), ".cache", "redis-windows");

export async function ensureWindowsRedis(): Promise<string> {
  const serverPath = join(CACHE_DIR, "redis-server.exe");

  if (existsSync(serverPath)) {
    return serverPath;
  }

  mkdirSync(CACHE_DIR, { recursive: true });
  const zipPath = join(CACHE_DIR, "redis.zip");

  console.log("Downloading Redis 5.0.14 for Windows...");
  const response = await fetch(REDIS_WINDOWS_URL);

  if (!response.ok || !response.body) {
    throw new Error(`Failed to download Redis for Windows (${response.status})`);
  }

  const fileStream = createWriteStream(zipPath);
  await pipeline(Readable.fromWeb(response.body as never), fileStream);

  console.log("Extracting Redis...");
  const { execFileSync } = await import("node:child_process");
  execFileSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Expand-Archive -Path '${zipPath}' -DestinationPath '${CACHE_DIR}' -Force`,
    ],
    { stdio: "inherit" },
  );

  if (!existsSync(serverPath)) {
    throw new Error("Redis server binary not found after extraction");
  }

  return serverPath;
}

export async function startWindowsRedis(port = 6379): Promise<{
  url: string;
  process: ChildProcess;
}> {
  const serverPath = await ensureWindowsRedis();
  const child = spawn(serverPath, ["--port", String(port), "--bind", "127.0.0.1"], {
    stdio: "ignore",
    windowsHide: true,
  });

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Redis startup timeout")), 10000);

    child.on("spawn", () => {
      clearTimeout(timeout);
      resolve();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });

  // Allow Redis to finish booting
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    url: `redis://127.0.0.1:${port}`,
    process: child,
  };
}

export function stopWindowsRedis(child: ChildProcess): Promise<void> {
  return new Promise((resolve) => {
    if (child.killed) {
      resolve();
      return;
    }

    child.once("exit", () => resolve());
    child.kill();
  });
}
