import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    example: 'My Workspace',
    description: 'The name of the project',
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'My personal workspace for AI projects',
    description: 'Description of the project',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
