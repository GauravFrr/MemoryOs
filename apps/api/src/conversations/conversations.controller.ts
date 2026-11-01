import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationProjectDto } from './dto/update-conversation-project.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClerkGuard } from '../auth/clerk.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AiService } from '../ai/ai.service';

@ApiTags('Conversations')
@ApiBearerAuth()
@UseGuards(ClerkGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly aiService: AiService,
    @InjectQueue('memory-extraction') private memoryExtractionQueue: Queue,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Save a new conversation from extension' })
  @ApiResponse({ status: 201, description: 'Conversation saved' })
  async create(
    @CurrentUser() user: any,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    const userId = user.id;
    const conversation = await this.conversationsService.create(
      userId,
      createConversationDto,
    );

    // Queue background extraction job
    await this.memoryExtractionQueue.add('extract', {
      userId,
      conversationId: conversation.id,
    });

    return conversation;
  }

  @Post(':id/extract')
  @ApiOperation({
    summary: 'Manually trigger memory extraction for a conversation',
  })
  @ApiResponse({ status: 202, description: 'Extraction job queued' })
  async triggerExtraction(@CurrentUser() user: any, @Param('id') id: string) {
    const userId = user.id;
    // Verify conversation belongs to user
    await this.conversationsService.findOne(userId, id);

    await this.memoryExtractionQueue.add('extract', {
      userId,
      conversationId: id,
    });
    return { status: 'queued', conversationId: id };
  }

  @Get('by-url')
  @ApiOperation({ summary: 'Get conversation summary by session URL' })
  @ApiResponse({ status: 200, description: 'Summary returned or generated' })
  async getByUrl(
    @CurrentUser() user: any,
    @Query('url') url: string,
  ) {
    if (!url) throw new BadRequestException('url query parameter is required');
    const result = await this.conversationsService.getSummaryForUrl(user.id, url);
    return result; // null if not found (frontend handles this)
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Generate a short summary of the conversation' })
  @ApiResponse({ status: 200, description: 'Summary generated' })
  async getSummary(@CurrentUser() user: any, @Param('id') id: string) {
    const userId = user.id;
    const conversation = await this.conversationsService.findOne(userId, id);

    const summary = await this.aiService.summarize(
      userId,
      conversation.messages,
    );
    return { summary };
  }

  @Get()
  @ApiOperation({ summary: 'List all conversations for the current user' })
  @ApiResponse({ status: 200, description: 'List returned' })
  findAll(@CurrentUser() user: any) {
    return this.conversationsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific conversation by ID' })
  @ApiResponse({ status: 200, description: 'Conversation found' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.conversationsService.findOne(user.id, id);
  }

  @Patch(':id/project')
  @ApiOperation({ summary: 'Move a conversation to a different project' })
  @ApiResponse({ status: 200, description: 'Conversation updated' })
  updateProject(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateConversationProjectDto: UpdateConversationProjectDto,
  ) {
    return this.conversationsService.updateProject(
      user.id,
      id,
      updateConversationProjectDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a conversation and its messages' })
  @ApiResponse({ status: 200, description: 'Conversation deleted' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.conversationsService.remove(user.id, id);
  }
}
