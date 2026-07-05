import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Sse,
  UseGuards,
  MessageEvent,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Observable, Subject } from 'rxjs';
import { AiService } from './ai.service';
import { AiDraftAssistantService } from './ai-draft-assistant.service';
import {
  ChatDto,
  GenerateDraftDto,
  RiskCheckDto,
  ImproveTextDto,
  GuidedDraftDto,
} from './dto/ai.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/auth.decorators';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly draftAssistant: AiDraftAssistantService,
  ) {}

  private handleAiError(err: any, context: string): never {
    const message = err?.message || 'Unknown AI error';
    this.logger.error(`AI ${context} failed: ${message}`);

    // Check for common API errors
    if (message.includes('API key') || message.includes('Incorrect API key') || message.includes('apiKey')) {
      throw new HttpException(
        `AI service authentication failed. Please check the API key configuration. (${context})`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    if (message.includes('quota') || message.includes('rate limit') || message.includes('429')) {
      throw new HttpException(
        `AI service rate limit reached. Please try again in a moment.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (message.includes('model') && message.includes('not found')) {
      throw new HttpException(
        `AI model not available. Please check the model configuration.`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    throw new HttpException(
      `AI service error: ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Post('chat')
  @ApiOperation({ summary: 'Send chat messages to AI and get a response' })
  async chat(@Body() dto: ChatDto) {
    try {
      return await this.aiService.chat(dto.messages);
    } catch (err) {
      this.handleAiError(err, 'chat');
    }
  }

  @Post('chat/stream')
  @ApiOperation({ summary: 'Stream chat response via SSE' })
  @Sse()
  chatStream(@Body() dto: ChatDto): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();

    (async () => {
      try {
        const stream = this.aiService.chatStream(dto.messages);
        for await (const token of stream) {
          subject.next({ data: JSON.stringify({ token }) } as MessageEvent);
        }
        subject.next({
          data: JSON.stringify({ done: true }),
        } as MessageEvent);
        subject.complete();
      } catch (err) {
        subject.next({
          data: JSON.stringify({
            error: (err as Error).message,
          }),
        } as MessageEvent);
        subject.complete();
      }
    })();

    return subject.asObservable();
  }

  @Post('generate-draft')
  @ApiOperation({ summary: 'Generate a complete legal draft from parameters' })
  async generateDraft(@Body() dto: GenerateDraftDto) {
    try {
      return await this.aiService.generateDraft(dto);
    } catch (err) {
      this.handleAiError(err, 'generate-draft');
    }
  }

  @Post('risk-check')
  @ApiOperation({ summary: 'Analyze a draft for legal risks' })
  async riskCheck(@Body() dto: RiskCheckDto) {
    try {
      return await this.aiService.riskCheck(dto.content);
    } catch (err) {
      this.handleAiError(err, 'risk-check');
    }
  }

  @Post('improve-text')
  @ApiOperation({ summary: 'Improve selected text with AI' })
  async improveText(@Body() dto: ImproveTextDto) {
    try {
      return await this.aiService.improveText(dto);
    } catch (err) {
      this.handleAiError(err, 'improve-text');
    }
  }

  // ── Guided Draft ─────────────────────────────────────────────────────

  @Get('guided-draft/types')
  @ApiOperation({ summary: 'Get available draft types for guided drafting' })
  getGuidedDraftTypes() {
    return this.draftAssistant.getAvailableDraftTypes();
  }

  @Post('guided-draft')
  @ApiOperation({ summary: 'Start or continue a guided draft Q&A session' })
  guidedDraft(
    @Body() dto: GuidedDraftDto,
    @CurrentUser() user: { id: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.draftAssistant.processGuidedDraft(
      user.id,
      tenantId || 'default',
      dto,
    );
  }
}
