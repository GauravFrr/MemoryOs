import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Search memories using semantic similarity via pgvector.
   */
  async semanticSearch(userId: string, projectId: string | null, embedding: number[], limit: number = 20) {
    let query;
    if (projectId) {
      query = await this.prisma.$queryRawUnsafe(`
        SELECT m.id, m.content, 
          1 - (m.embedding <=> $1::vector) AS similarity,
          (1 - (m.embedding <=> $1::vector)) + (m.score / 100.0) AS combined_score
        FROM memories m
        WHERE m.user_id = $2::uuid AND (m.project_id = $3::uuid OR m.project_id IS NULL)
        ORDER BY combined_score DESC, m.created_at DESC
        LIMIT $4;
      `, `[${embedding.join(',')}]`, userId, projectId, limit);
    } else {
      query = await this.prisma.$queryRawUnsafe(`
        SELECT m.id, m.content, 
          1 - (m.embedding <=> $1::vector) AS similarity,
          (1 - (m.embedding <=> $1::vector)) + (m.score / 100.0) AS combined_score
        FROM memories m
        WHERE m.user_id = $2::uuid
        ORDER BY combined_score DESC, m.created_at DESC
        LIMIT $3;
      `, `[${embedding.join(',')}]`, userId, limit);
    }

    return query;
  }

  /**
   * Fallback for when no topic is provided.
   * Just returns top memories by score and recency.
   */
  async fetchTopMemories(userId: string, projectId: string | null, limit: number = 20) {
    if (projectId) {
      return this.prisma.$queryRawUnsafe(`
        SELECT m.id, m.content, 
          (m.score / 100.0) AS combined_score
        FROM memories m
        WHERE m.user_id = $1::uuid AND (m.project_id = $2::uuid OR m.project_id IS NULL)
        ORDER BY m.score DESC, m.created_at DESC
        LIMIT $3;
      `, userId, projectId, limit);
    } else {
      return this.prisma.$queryRawUnsafe(`
        SELECT m.id, m.content, 
          (m.score / 100.0) AS combined_score
        FROM memories m
        WHERE m.user_id = $1::uuid
        ORDER BY m.score DESC, m.created_at DESC
        LIMIT $2;
      `, userId, limit);
    }
  }
}
