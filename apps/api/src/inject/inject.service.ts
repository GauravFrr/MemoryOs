import { Injectable, Logger } from '@nestjs/common';
import { BuildInjectionDto } from './dto/build-injection.dto';
import { AiService } from '../ai/ai.service';
import { SearchService } from '../search/search.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class InjectService {
  private readonly logger = new Logger(InjectService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly searchService: SearchService,
    private readonly prisma: PrismaService,
    private readonly conversationsService: ConversationsService,
  ) {}

  async buildContext(userId: string, dto: BuildInjectionDto) {
    const mode = dto.mode ?? 'global';

    // Retrieve project name if project_id is provided
    let projectName = 'All Projects';
    if (dto.project_id) {
      const project = await this.prisma.project.findUnique({ where: { id: dto.project_id } });
      if (project) projectName = project.name;
    }

    let globalBlock = '';
    let chatBlock = '';

    // ── Global memories block ────────────────────────────────────────────────
    if (mode === 'global' || mode === 'combined') {
      let memories: any[] = [];

      if (dto.topic) {
        const vector = await this.aiService.embed(userId, dto.topic);
        memories = await this.searchService.semanticSearch(userId, dto.project_id || null, vector, 20) as any[];
      } else {
        memories = await this.searchService.fetchTopMemories(userId, dto.project_id || null, 20) as any[];
      }

      if (memories.length > 0) {
        globalBlock = `[MemoryOS Context — ${projectName}]\n`;
        let tokenEstimate = Math.ceil(globalBlock.length / 4);

        for (const memory of memories) {
          const bullet = `• ${memory.content}\n`;
          const bulletTokens = Math.ceil(bullet.length / 4);
          if (tokenEstimate + bulletTokens > dto.max_tokens) break;
          globalBlock += bullet;
          tokenEstimate += bulletTokens;
        }
      }
    }

    // ── Chat summary block ───────────────────────────────────────────────────
    if (mode === 'chat_summary' || mode === 'combined') {
      if (!dto.session_url) {
        this.logger.warn('chat_summary mode requested but session_url was not provided');
      } else {
        const chatData = await this.conversationsService.getSummaryForUrl(userId, dto.session_url);
        if (chatData) {
          chatBlock = `[MemoryOS — This Chat]\n• ${chatData.messageCount} messages`;
          if (chatData.title) chatBlock += `, ${chatData.title}`;
          chatBlock += `\n`;
          // Add summary bullet points (AI returns a paragraph — split on ". " for bullets)
          const summaryLines = chatData.summary
            .split(/\.\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .slice(0, 6); // Max 6 bullet points
          for (const line of summaryLines) {
            chatBlock += `• ${line}.\n`;
          }
        }
      }
    }

    // ── Assemble final context ────────────────────────────────────────────────
    let contextString = '';
    if (globalBlock) contextString += globalBlock;
    if (chatBlock) {
      if (contextString) contextString += '\n'; // Separate blocks with blank line
      contextString += chatBlock;
    }

    const memoriesUsed = (globalBlock ? 1 : 0) + (chatBlock ? 1 : 0);
    const tokenEstimate = Math.ceil(contextString.length / 4);

    // Track usage in database
    await this.prisma.usageLog.create({
      data: {
        userId,
        action: 'injection_built',
        metadata: {
          platform: dto.platform,
          project_id: dto.project_id,
          topic: dto.topic,
          mode,
          session_url: dto.session_url,
          memories_used: memoriesUsed,
          token_estimate: tokenEstimate,
        },
      },
    });

    return {
      context_string: contextString,
      memories_used: memoriesUsed,
      token_estimate: tokenEstimate,
    };
  }
}
