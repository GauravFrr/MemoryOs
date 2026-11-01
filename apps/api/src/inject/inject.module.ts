import { Module } from '@nestjs/common';
import { InjectController } from './inject.controller';
import { InjectService } from './inject.service';
import { AiModule } from '../ai/ai.module';
import { SearchModule } from '../search/search.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [AiModule, SearchModule, PrismaModule, ConversationsModule],
  controllers: [InjectController],
  providers: [InjectService],
})
export class InjectModule {}
