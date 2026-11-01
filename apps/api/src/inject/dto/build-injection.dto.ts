import { IsString, IsOptional, IsUUID, IsNumber, IsIn, Max, Min } from 'class-validator';

export class BuildInjectionDto {
  @IsString()
  platform: string;

  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsNumber()
  @Max(8000)
  @Min(1)
  max_tokens: number;

  /**
   * Injection mode:
   * - "global" (default): inject memories from all past conversations
   * - "chat_summary": inject a summary of the current specific chat
   * - "combined": inject both global memories AND the chat summary
   */
  @IsOptional()
  @IsIn(['global', 'chat_summary', 'combined'])
  mode?: 'global' | 'chat_summary' | 'combined';

  /**
   * The URL of the current open chat page. Required when mode is "chat_summary" or "combined".
   */
  @IsOptional()
  @IsString()
  session_url?: string;
}
