import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({ example: 'user' })
  @IsString()
  role: string;

  @ApiProperty({ example: 'Hello world' })
  @IsString()
  content: string;

  @ApiProperty({ example: '2026-06-29T11:00:00Z' })
  @IsDateString()
  timestamp: string;
}

export class CreateConversationDto {
  @ApiProperty({ example: 'chatgpt' })
  @IsString()
  platform: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ example: 'https://chat.openai.com/...' })
  @IsString()
  @IsOptional()
  sessionUrl?: string;

  @ApiPropertyOptional({ example: 'Discussion about AI' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: '2026-06-29T11:00:00Z' })
  @IsDateString()
  startedAt: string;

  @ApiPropertyOptional({ example: '2026-06-29T11:30:00Z' })
  @IsDateString()
  @IsOptional()
  endedAt?: string;

  @ApiProperty({ type: [MessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];
}
