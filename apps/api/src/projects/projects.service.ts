import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id, userId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(userId: string, id: string, updateProjectDto: UpdateProjectDto) {
    await this.findOne(userId, id); // Ensure it exists and belongs to user
    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // Ensure it exists and belongs to user
    return this.prisma.project.delete({
      where: { id },
    });
  }

  async getStats(userId: string, id: string) {
    await this.findOne(userId, id); // Ensure it exists and belongs to user

    const [memoriesCount, conversationsCount] = await Promise.all([
      this.prisma.memory.count({ where: { projectId: id } }),
      this.prisma.conversation.count({ where: { projectId: id } }),
    ]);

    return {
      memoriesCount,
      conversationsCount,
    };
  }
}
