import { Controller, Post, Param, Res, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { DocxExportService } from './docx-export.service';
import { PdfExportService } from './pdf-export.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/rbac/permissions.guard';
import { RequirePermission } from '../../auth/rbac/permission.decorator';
import { Permission } from '../../auth/rbac/permissions';

@ApiTags('Export')
@Controller('export')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission(Permission.EXPORT)
@ApiBearerAuth()
export class ExportController {
  constructor(
    private readonly docxExport: DocxExportService,
    private readonly pdfExport: PdfExportService,
  ) {}

  @Post('docx/:draftId')
  @ApiOperation({ summary: 'Export draft as DOCX' })
  async exportDocx(
    @Param('draftId') draftId: string,
    @Body() body: { content?: string; title?: string },
    @Res() res: Response,
  ) {
    const content = body.content || 'Draft content placeholder';
    const title = body.title || 'Legal Draft';
    const buffer = await this.docxExport.generateFromText(content, title);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${title.replace(/\s+/g, '_')}.docx"`,
    });
    res.send(buffer);
  }

  @Post('pdf/:draftId')
  @ApiOperation({ summary: 'Export draft as PDF' })
  async exportPdf(
    @Param('draftId') draftId: string,
    @Body() body: { content?: string; title?: string },
    @Res() res: Response,
  ) {
    const content = body.content || 'Draft content placeholder';
    const title = body.title || 'Legal Draft';
    const buffer = await this.pdfExport.generateFromText(content, title);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`,
    });
    res.send(buffer);
  }
}
