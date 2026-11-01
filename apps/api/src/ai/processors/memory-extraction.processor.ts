import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiService } from '../ai.service';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('memory-extraction')
export class MemoryExtractionProcessor extends WorkerHost {
  private readonly logger = new Logger(MemoryExtractionProcessor.name);

  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { conversationId, userId } = job.data;
    this.logger.log(`Processing extraction for conversation ${conversationId}`);

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });

    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Extract memories using Gemini
    const memories = await this.aiService.extract(
      userId,
      conversation.messages,
    );

    // Save as suggestions
    if (memories && memories.length > 0) {
      for (const mem of memories) {
        await this.prisma.memorySuggestion.create({
          data: {
            userId,
            conversationId,
            type: mem.type,
            content: mem.content,
            structuredData: mem.metadata || {},
            status: 'pending',
          },
        });
      }
      this.logger.log(`Extracted ${memories.length} memories as suggestions.`);
    }

    return { success: true, count: memories?.length || 0 };
  }
}
