import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const user = await prisma.user.upsert({
    where: { clerkId: "user_seed_test_001" },
    update: {},
    create: {
      clerkId: "user_seed_test_001",
      email: "seed@memoryos.dev",
      displayName: "Seed Test User",
      timezone: "UTC",
      plan: "free",
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      userId: user.id,
      name: "AI Story Channel",
      description: "Seed project for development testing",
      color: "#7C5CFC",
      icon: "🎬",
      keywords: ["youtube", "hindi", "shorts"],
      platforms: ["claude", "chatgpt"],
      memoryCount: 2,
    },
  });

  await prisma.memory.deleteMany({
    where: {
      userId: user.id,
      id: {
        in: [
          "00000000-0000-4000-8000-000000000101",
          "00000000-0000-4000-8000-000000000102",
        ],
      },
    },
  });

  const memory1 = await prisma.memory.create({
    data: {
      id: "00000000-0000-4000-8000-000000000101",
      userId: user.id,
      projectId: project.id,
      type: "preference",
      content: "Prefers 5-second scene length for YouTube Shorts",
      structuredData: { scene_length: "5 seconds" },
      score: 72,
      confidence: 0.9,
      status: "active",
      platform: "claude",
    },
  });

  const memory2 = await prisma.memory.create({
    data: {
      id: "00000000-0000-4000-8000-000000000102",
      userId: user.id,
      projectId: project.id,
      type: "tool",
      content: "Uses Wan 2.2 for AI animation",
      structuredData: { tool: "Wan 2.2", use_case: "AI animation" },
      score: 68,
      confidence: 0.85,
      status: "active",
      platform: "chatgpt",
    },
  });

  console.log("Seed complete:");
  console.log(`  User:    ${user.email} (${user.id})`);
  console.log(`  Project: ${project.name} (${project.id})`);
  console.log(`  Memory:  ${memory1.content}`);
  console.log(`  Memory:  ${memory2.content}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
