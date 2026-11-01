import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiService } from '../ai.service';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('embeddings')
export class EmbeddingsProcessor extends WorkerHost {
  private readonly logger = new Logger(EmbeddingsProcessor.name);

  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { memoryId, userId } = job.data;
    this.logger.log(`Processing embedding for memory ${memoryId}`);

    const memory = await this.prisma.memory.findUnique({
      where: { id: memoryId },
    });

    if (!memory) {
      throw new Error(`Memory ${memoryId} not found`);
    }

    // Generate embedding using Gemini
    const vector = await this.aiService.embed(userId, memory.content);

    // Convert array to pgvector string format: '[0.1, 0.2, ...]'
    const vectorString = `[${vector.join(',')}]`;

    // Store vector using raw query (Prisma doesn't natively support updating vector cols directly yet)
    await this.prisma.$executeRawUnsafe(
      `UPDATE memories SET embedding = $1::vector WHERE id = $2::uuid`,
      vectorString,
      memoryId,
    );

    this.logger.log(
      `Successfully generated and saved embedding for memory ${memoryId}`,
    );
    return { success: true };
  }
}
