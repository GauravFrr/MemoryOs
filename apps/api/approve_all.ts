import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';

const prisma = new PrismaClient();

async function main() {
  const userId = '2fe48aa7-cf9f-4798-9ef7-24a605105a58'; // User itzmi3xel@gmail.com
  
  const pendingSuggestions = await prisma.memorySuggestion.findMany({
    where: { userId, status: 'pending' }
  });
  
  console.log(`Found ${pendingSuggestions.length} pending suggestions for user.`);
  
  // Set up connection for BullMQ
  const embeddingsQueue = new Queue('embeddings', {
    connection: {
      host: '127.0.0.1',
      port: 6379,
    }
  });

  for (const suggestion of pendingSuggestions) {
    console.log(`Approving: "${suggestion.content}"`);
    
    // 1. Create active memory
    const memory = await prisma.memory.create({
      data: {
        userId,
        conversationId: suggestion.conversationId,
        type: suggestion.type,
        content: suggestion.content,
        structuredData: suggestion.structuredData as any,
        status: 'active',
      },
    });

    // 2. Mark suggestion approved
    await prisma.memorySuggestion.update({
      where: { id: suggestion.id },
      data: {
        status: 'approved',
        memoryId: memory.id,
        reviewedAt: new Date(),
      },
    });

    // 3. Queue embedding generation
    await embeddingsQueue.add('embed', { memoryId: memory.id, userId });
  }

  await embeddingsQueue.close();
  console.log('All suggestions approved and queued for embeddings successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
