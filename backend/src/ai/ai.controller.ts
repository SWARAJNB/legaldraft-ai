import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, Subject } from 'rxjs';
import { AiService } from './ai.service';
import { AiDraftAssistantService } from './ai-draft-assistant.service';
import { AiConversation } from './entities/ai-conversation.entity';
import {
  ChatDto,
  GenerateDraftDto,
  RiskCheckDto,
  ImproveTextDto,
  GuidedDraftDto,
} from './dto/ai.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/auth.decorators';
import { AiManagerService } from './agents/ai-manager.service';
import { PermissionsGuard } from '../auth/rbac/permissions.guard';
import { RequirePermission } from '../auth/rbac/permission.decorator';
import { Permission } from '../auth/rbac/permissions';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission(Permission.AI)
@ApiBearerAuth()
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly draftAssistant: AiDraftAssistantService,
    @InjectRepository(AiConversation)
    private readonly conversationsRepo: Repository<AiConversation>,
    private readonly aiManagerService: AiManagerService,
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

  @Post('knowledge-answer')
  @ApiOperation({ summary: 'Answer a question using the RAG knowledge base pipeline' })
  async knowledgeAnswer(
    @Body()
    body: {
      question: string;
      workspace_id?: string;
      case_id?: string;
    },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    try {
      return await this.aiService.answerWithKnowledge({
        question: body.question,
        tenantId: tenantId || 'default-tenant',
        workspaceId: body.workspace_id,
        caseId: body.case_id,
      });
    } catch (err) {
      this.handleAiError(err, 'knowledge-answer');
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

  // ── Chat Conversations History & Streaming ───────────────────────────

  @Get('conversations')
  @ApiOperation({ summary: 'Get all chat conversations for user' })
  async getConversations(
    @CurrentUser() user: { id: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    try {
      return await this.conversationsRepo.find({
        where: {
          userId: user.id,
          tenantId: tenantId || 'default',
          sessionType: 'chat',
        },
        order: { updatedAt: 'DESC' },
      });
    } catch (err) {
      this.handleAiError(err, 'getConversations');
    }
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a single conversation by ID' })
  async getConversation(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    try {
      const conv = await this.conversationsRepo.findOne({
        where: { id, userId: user.id },
      });
      if (!conv) {
        throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
      }
      return conv;
    } catch (err) {
      this.handleAiError(err, 'getConversation');
    }
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  async createConversation(
    @Body() body: { title?: string },
    @CurrentUser() user: { id: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    try {
      const conv = this.conversationsRepo.create({
        userId: user.id,
        tenantId: tenantId || 'default',
        sessionType: 'chat',
        draftType: '',
        currentStep: 0,
        collectedAnswers: {},
        messages: [],
        isComplete: false,
        title: body.title || 'New Chat',
      });
      return await this.conversationsRepo.save(conv);
    } catch (err) {
      this.handleAiError(err, 'createConversation');
    }
  }

  @Put('conversations/:id')
  @ApiOperation({ summary: 'Update conversation properties' })
  async updateConversation(
    @Param('id') id: string,
    @Body() body: { title?: string },
    @CurrentUser() user: { id: string },
  ) {
    try {
      const conv = await this.conversationsRepo.findOne({
        where: { id, userId: user.id },
      });
      if (!conv) {
        throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
      }
      if (body.title) {
        conv.title = body.title;
      }
      return await this.conversationsRepo.save(conv);
    } catch (err) {
      this.handleAiError(err, 'updateConversation');
    }
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Delete a conversation' })
  async deleteConversation(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    try {
      const conv = await this.conversationsRepo.findOne({
        where: { id, userId: user.id },
      });
      if (!conv) {
        throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
      }
      await this.conversationsRepo.remove(conv);
      return { message: 'Conversation deleted successfully' };
    } catch (err) {
      this.handleAiError(err, 'deleteConversation');
    }
  }

  @Post('conversations/:id/messages/stream')
  @ApiOperation({ summary: 'Stream conversation chat response via SSE' })
  @Sse()
  async conversationsChatStream(
    @Param('id') id: string,
    @Body() body: { content: string; context?: any; mode?: string; selectedAgent?: string },
    @CurrentUser() user: { id: string },
    @Headers('x-tenant-id') tenantId: string,
  ): Promise<Observable<MessageEvent>> {
    this.logger.log('[AI] Request received');
    const conv = await this.conversationsRepo.findOne({
      where: { id, userId: user.id },
    });
    if (!conv) {
      throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
    }
    this.logger.log('[AI] Conversation loaded');

    // Append user message
    const userMsg = {
      role: 'user',
      content: body.content,
      timestamp: new Date().toISOString(),
    };
    conv.messages.push(userMsg);
    await this.conversationsRepo.save(conv);

    const subject = new Subject<MessageEvent>();

    (async () => {
      try {
        const historyMessages = conv.messages.slice(0, -1).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const stream = this.aiManagerService.executeStream({
          tenantId: tenantId || 'default-tenant',
          userId: user.id,
          conversationId: id,
          message: body.content,
          messages: historyMessages,
          frontendContext: body.context,
          mode: body.mode as any,
          selectedAgent: body.selectedAgent as any,
        });

        let assistantContent = '';
        for await (const chunk of stream) {
          if (chunk.token) {
            assistantContent += chunk.token;
          }
          subject.next({ data: JSON.stringify(chunk) } as MessageEvent);
        }

        // Save complete response
        const assistantMsg = {
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date().toISOString(),
        };
        conv.messages.push(assistantMsg);
        await this.conversationsRepo.save(conv);

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
}
