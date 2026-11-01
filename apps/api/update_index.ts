import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  console.log('Recreating HNSW index...');
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS idx_memories_embedding;`);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX idx_memories_embedding
    ON memories USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
  `);
  console.log('HNSW index created successfully!');
  process.exit(0);
}

main().catch(console.error);
