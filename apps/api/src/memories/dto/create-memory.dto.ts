import { IsString, IsOptional, IsUUID, IsIn, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMemoryDto {
  @ApiProperty({
    example: 'fact',
    enum: ['fact', 'preference', 'core_belief', 'project_context'],
  })
  @IsString()
  @IsIn(['fact', 'preference', 'core_belief', 'project_context'])
  type: string;

  @ApiProperty({ example: 'User prefers Zustand over Redux' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @ApiPropertyOptional({ example: { source: 'user input' } })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
