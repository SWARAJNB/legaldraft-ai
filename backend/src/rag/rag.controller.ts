import { Body, Controller, Get, Headers, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RagService } from './rag.service';

@ApiTags('RAG')
@Controller('rag')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Get('knowledge-base')
  @ApiOperation({ summary: 'Get indexed knowledge base documents and source status' })
  getKnowledgeBase(
    @Headers('x-tenant-id') tenantId: string,
    @Query('workspace_id') workspaceId?: string,
    @Query('case_id') caseId?: string,
  ) {
    return this.ragService.getKnowledgeBase({
      tenantId: tenantId || 'default-tenant',
      workspaceId,
      caseId,
    });
  }

  @Post('search')
  @ApiOperation({ summary: 'Run hybrid retrieval over PostgreSQL FTS and local ChromaDB vectors' })
  search(
    @Headers('x-tenant-id') tenantId: string,
    @Body()
    body: {
      question: string;
      workspace_id?: string;
      case_id?: string;
      top_k?: number;
    },
  ) {
    return this.ragService.retrieve({
      tenantId: tenantId || 'default-tenant',
      workspaceId: body.workspace_id,
      caseId: body.case_id,
      question: body.question,
      topK: body.top_k || 8,
    });
  }
}
