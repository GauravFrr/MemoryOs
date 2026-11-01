import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationProjectDto } from './dto/update-conversation-project.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async create(userId: string, createConversationDto: CreateConversationDto) {
    const { messages, ...conversationData } = createConversationDto;

    return this.prisma.conversation.create({
      data: {
        ...conversationData,
        userId,
        messages: {
          create: messages.map((m, index) => ({
            ...m,
            userId,
            position: index,
          })),
        },
        messageCount: messages.length,
      },
      include: {
        messages: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        project: true,
      },
    });
  }

  async findOne(userId: string, id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id, userId },
      include: {
        messages: true,
        project: true,
      },
    });
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    return conversation;
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.conversation.delete({
      where: { id },
    });
  }

  async updateProject(
    userId: string,
    id: string,
    dto: UpdateConversationProjectDto,
  ) {
    await this.findOne(userId, id);

    // Ensure the target project also belongs to the user
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId, userId },
      });
      if (!project) {
        throw new NotFoundException(
          `Project with ID ${dto.projectId} not found`,
        );
      }
    }

    return this.prisma.conversation.update({
      where: { id },
      data: { projectId: dto.projectId },
    });
  }

  /**
   * Find a conversation by session URL and return its summary.
   * If no summary is cached, auto-generates one with AI and caches it.
   * Returns null if no conversation found for this URL.
   */
  async getSummaryForUrl(userId: string, sessionUrl: string): Promise<{
    conversationId: string;
    summary: string;
    messageCount: number;
    title: string | null;
  } | null> {
    const conversation = await this.prisma.conversation.findFirst({
      where: { userId, sessionUrl },
      orderBy: { startedAt: 'desc' },
      include: { messages: true },
    });

    if (!conversation) return null;

    // If summary already cached, return it
    if (conversation.summary) {
      return {
        conversationId: conversation.id,
        summary: conversation.summary,
        messageCount: conversation.messageCount,
        title: conversation.title,
      };
    }

    // Generate summary with AI and cache it
    const summary = await this.aiService.summarize(userId, conversation.messages);
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { summary },
    });

    return {
      conversationId: conversation.id,
      summary,
      messageCount: conversation.messageCount,
      title: conversation.title,
    };
  }

  /**
   * Create a conversation and immediately generate + cache a summary for injection.
   * Used by the "Inject This Chat" feature when a chat hasn't been saved yet.
   */
  async createAndSummarize(userId: string, createConversationDto: CreateConversationDto): Promise<{
    conversationId: string;
    summary: string;
    messageCount: number;
    title: string | null;
  }> {
    const conversation = await this.create(userId, createConversationDto);
    const summary = await this.aiService.summarize(userId, conversation.messages);
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { summary },
    });

    return {
      conversationId: conversation.id,
      summary,
      messageCount: conversation.messageCount,
      title: conversation.title,
    };
  }
}
