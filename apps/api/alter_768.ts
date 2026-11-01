import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  console.log('Clearing existing 3072-dim embeddings...');
  await prisma.$executeRawUnsafe(`UPDATE memories SET embedding = NULL;`);
  
  console.log('Altering database column size to 768...');
  await prisma.$executeRawUnsafe(`ALTER TABLE memories ALTER COLUMN embedding TYPE vector(768);`);
  console.log('Database altered successfully!');
  
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
