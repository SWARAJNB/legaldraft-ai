import { Controller, Post, Param, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { DocxExportService } from './docx-export.service';
import { PdfExportService } from './pdf-export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Export')
@Controller('export')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportController {
  constructor(
    private readonly docxExport: DocxExportService,
    private readonly pdfExport: PdfExportService,
  ) {}

  @Post('docx/:draftId')
  @ApiOperation({ summary: 'Export draft as DOCX' })
  async exportDocx(@Param('draftId') draftId: string, @Res() res: Response) {
    // TODO: Fetch draft content from DraftsService
    const content = 'Draft content placeholder';
    const title = 'Legal Draft';
    const buffer = await this.docxExport.generateFromText(content, title);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="draft_${draftId}.docx"`,
    });
    res.send(buffer);
  }

  @Post('pdf/:draftId')
  @ApiOperation({ summary: 'Export draft as PDF' })
  async exportPdf(@Param('draftId') draftId: string, @Res() res: Response) {
    // TODO: Fetch draft content from DraftsService
    const content = 'Draft content placeholder';
    const title = 'Legal Draft';
    const buffer = await this.pdfExport.generateFromText(content, title);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="draft_${draftId}.pdf"`,
    });
    res.send(buffer);
  }
}
