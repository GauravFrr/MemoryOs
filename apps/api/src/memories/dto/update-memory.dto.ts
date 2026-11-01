import { PartialType } from '@nestjs/swagger';
import { CreateMemoryDto } from './create-memory.dto';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMemoryDto extends PartialType(CreateMemoryDto) {
  @ApiPropertyOptional({
    example: 'active',
    enum: ['active', 'archived', 'pending_approval', 'rejected'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'archived', 'pending_approval', 'rejected'])
  status?: string;
}
