import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/auth.decorators';

@ApiTags('Templates')
@Controller('templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List all templates (system + tenant)' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.templatesService.findAll(tenantId, search, category);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a DOCX/DOC template file' })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: { id: string },
    @Body('name') name: string,
    @Body('description') description?: string,
  ) {
    return this.templatesService.uploadTemplate(
      tenantId || 'default',
      user.id,
      file,
      name,
      description,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  findById(@Param('id') id: string) {
    return this.templatesService.findById(id);
  }

  @Post(':id/placeholders')
  @ApiOperation({ summary: 'Save manual placeholders confirmation' })
  savePlaceholders(
    @Param('id') id: string,
    @Body() body: { placeholders: any[] },
    @CurrentUser() user: { id: string },
  ) {
    return this.templatesService.savePlaceholders(id, body.placeholders, user.id);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get template version history' })
  getVersions(@Param('id') id: string) {
    return this.templatesService.getVersions(id);
  }

  @Post(':id/versions/:versionNumber/restore')
  @ApiOperation({ summary: 'Restore a template version' })
  restoreVersion(
    @Param('id') id: string,
    @Param('versionNumber') versionNumber: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.templatesService.restoreVersion(id, parseInt(versionNumber, 10), user.id);
  }

  @Post(':id/generate')
  @ApiOperation({ summary: 'Generate a smart draft from template' })
  generateDraft(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() values: Record<string, any>,
  ) {
    return this.templatesService.generateDraft(id, tenantId || 'default', user.id, values);
  }

  @Post(':id/interview')
  @ApiOperation({ summary: 'Ask AI Interview question' })
  askInterviewQuestion(
    @Param('id') id: string,
    @Body() body: { answers: Record<string, string>; currentPlaceholder?: string },
  ) {
    return this.templatesService.askInterviewQuestion(id, body.answers, body.currentPlaceholder);
  }
}
