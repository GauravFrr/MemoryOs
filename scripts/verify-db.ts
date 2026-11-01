import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verify() {
  const users = await prisma.user.count();
  const projects = await prisma.project.count();
  const memories = await prisma.memory.count();

  const seedUser = await prisma.user.findUnique({
    where: { email: "seed@memoryos.dev" },
    include: {
      projects: { include: { memories: true } },
    },
  });

  console.log(`Counts: users=${users} projects=${projects} memories=${memories}`);
  console.log("Seed user:", seedUser?.email);
  console.log("Seed project:", seedUser?.projects[0]?.name);
  console.log("Seed memories:", seedUser?.projects[0]?.memories.map((m) => m.content));

  const extensions = await prisma.$queryRaw<{ extname: string }[]>`
    SELECT extname FROM pg_extension WHERE extname IN ('vector', 'uuid-ossp')
  `;
  console.log("Extensions:", extensions.map((e) => e.extname).join(", "));

  const hasEmbedding = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'memories' AND column_name IN ('embedding', 'search_vector')
  `;
  console.log("Memory columns:", hasEmbedding.map((c) => c.column_name).join(", "));
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
