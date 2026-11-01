import "dotenv/config";
import {
  startWindowsRedis,
  stopWindowsRedis,
} from "./lib/redis-windows";

async function startRedis() {
  if (process.platform !== "win32") {
    console.log("Use: docker compose up redis");
    process.exit(1);
  }

  const { url, process: child } = await startWindowsRedis(6379);
  console.log(`Redis dev server running at ${url}`);
  console.log("Press Ctrl+C to stop.");

  process.on("SIGINT", async () => {
    await stopWindowsRedis(child);
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await stopWindowsRedis(child);
    process.exit(0);
  });

  await new Promise(() => {});
}

startRedis().catch((error) => {
  console.error("Failed to start Redis:", error);
  process.exit(1);
});
