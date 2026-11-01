import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { UpdateMemoryDto } from './dto/update-memory.dto';
import { BulkApproveDto } from './dto/bulk-approve.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';

@Injectable()
export class MemoriesService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('embeddings') private embeddingsQueue: Queue,
  ) {}

  async create(userId: string, createMemoryDto: CreateMemoryDto) {
    const { metadata, ...rest } = createMemoryDto;

    return this.prisma.memory.create({
      data: {
        ...rest,
        userId,
        structuredData: metadata || {},
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.memory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        project: true,
      },
    });
  }

  async findSuggestions(userId: string) {
    return this.prisma.memorySuggestion.findMany({
      where: { userId, status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: {
        conversation: true,
      },
    });
  }

  async findOne(userId: string, id: string) {
    const memory = await this.prisma.memory.findUnique({
      where: { id, userId },
      include: {
        project: true,
      },
    });
    if (!memory) {
      throw new NotFoundException(`Memory with ID ${id} not found`);
    }
    return memory;
  }

  async update(userId: string, id: string, updateMemoryDto: UpdateMemoryDto) {
    await this.findOne(userId, id);

    const { metadata, ...rest } = updateMemoryDto;

    return this.prisma.memory.update({
      where: { id },
      data: {
        ...rest,
        ...(metadata && { structuredData: metadata }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.memory.delete({
      where: { id },
    });
  }

  async approve(userId: string, id: string) {
    const suggestion = await this.prisma.memorySuggestion.findUnique({
      where: { id, userId },
    });
    if (!suggestion) {
      throw new NotFoundException(`MemorySuggestion with ID ${id} not found`);
    }

    // Create the actual memory
    const memory = await this.prisma.memory.create({
      data: {
        userId,
        conversationId: suggestion.conversationId,
        type: suggestion.type,
        content: suggestion.content,
        structuredData: suggestion.structuredData as any,
        status: 'active',
      },
    });

    // Update suggestion
    await this.prisma.memorySuggestion.update({
      where: { id },
      data: { status: 'approved', memoryId: memory.id, reviewedAt: new Date() },
    });

    // Queue for embeddings
    await this.embeddingsQueue.add('embed', { memoryId: memory.id, userId });

    return memory;
  }

  async reject(userId: string, id: string) {
    const suggestion = await this.prisma.memorySuggestion.findUnique({
      where: { id, userId },
    });
    if (!suggestion) {
      throw new NotFoundException(`MemorySuggestion with ID ${id} not found`);
    }

    return this.prisma.memorySuggestion.update({
      where: { id },
      data: { status: 'rejected', reviewedAt: new Date() },
    });
  }

  async bulkApprove(userId: string, bulkApproveDto: BulkApproveDto) {
    const { memoryIds } = bulkApproveDto;

    const suggestions = await this.prisma.memorySuggestion.findMany({
      where: {
        id: { in: memoryIds },
        userId,
        status: 'pending',
      },
    });

    let approvedCount = 0;
    for (const suggestion of suggestions) {
      const memory = await this.prisma.memory.create({
        data: {
          userId,
          conversationId: suggestion.conversationId,
          type: suggestion.type,
          content: suggestion.content,
          structuredData: suggestion.structuredData as any,
          status: 'active',
        },
      });

      await this.prisma.memorySuggestion.update({
        where: { id: suggestion.id },
        data: { status: 'approved', memoryId: memory.id, reviewedAt: new Date() },
      });

      await this.embeddingsQueue.add('embed', { memoryId: memory.id, userId });
      approvedCount++;
    }

    return { updatedCount: approvedCount };
  }
}
