import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { BullModule } from '@nestjs/bullmq';
import { MemoryExtractionProcessor } from './processors/memory-extraction.processor';
import { EmbeddingsProcessor } from './processors/embeddings.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'memory-extraction',
    }),
    BullModule.registerQueue({
      name: 'embeddings',
    }),
  ],
  providers: [
    AiService,
    PrismaService,
    MemoryExtractionProcessor,
    EmbeddingsProcessor,
  ],
  exports: [AiService, BullModule],
})
export class AiModule {}
