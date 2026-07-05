import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ChatMessageDto {
  @ApiProperty({ enum: ['system', 'user', 'assistant'] })
  @IsString()
  role: 'system' | 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  content: string;
}

export class ChatDto {
  @ApiProperty({ type: [ChatMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];
}

export class GenerateDraftDto {
  @ApiProperty({ description: 'Type of legal draft' })
  @IsString()
  draft_type: string;

  @ApiPropertyOptional({ description: 'Client information' })
  @IsString()
  @IsOptional()
  client_info?: string;

  @ApiPropertyOptional({ description: 'Case facts and details' })
  @IsString()
  @IsOptional()
  case_details?: string;

  @ApiPropertyOptional({ description: 'Court or forum' })
  @IsString()
  @IsOptional()
  court?: string;

  @ApiPropertyOptional({ description: 'Relief/prayer sought' })
  @IsString()
  @IsOptional()
  relief?: string;
}

export class RiskCheckDto {
  @ApiProperty({ description: 'Draft content to analyze for risks' })
  @IsString()
  content: string;
}

export class ImproveTextDto {
  @ApiProperty({ description: 'Selected text to improve' })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Improvement action',
    enum: [
      'rewrite',
      'improve_legal_tone',
      'add_legal_arguments',
      'simplify',
      'expand',
      'fix_grammar',
    ],
  })
  @IsString()
  action: string;

  @ApiPropertyOptional({ description: 'Additional context for the AI' })
  @IsString()
  @IsOptional()
  context?: string;
}

export class GuidedDraftDto {
  @ApiPropertyOptional({ description: 'Existing session ID to continue' })
  @IsString()
  @IsOptional()
  session_id?: string;

  @ApiPropertyOptional({ description: 'Draft type (for new sessions)' })
  @IsString()
  @IsOptional()
  draft_type?: string;

  @ApiPropertyOptional({ description: 'User answer to current question' })
  @IsString()
  @IsOptional()
  answer?: string;
}
