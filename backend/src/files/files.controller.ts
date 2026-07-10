import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Headers,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/auth.decorators';
import { PermissionsGuard } from '../auth/rbac/permissions.guard';
import { RequirePermission } from '../auth/rbac/permission.decorator';
import { Permission } from '../auth/rbac/permissions';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission(Permission.DOCUMENT)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  @ApiOperation({ summary: 'List all uploaded files' })
  findAll(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('Missing X-Tenant-ID header.');
    return this.filesService.findByTenant(tenantId);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file to tenant storage' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: { id: string },
    @Body('category') category: string,
    @Body('workspace_id') workspaceId?: string,
    @Body('client_id') clientId?: string,
    @Body('case_id') caseId?: string,
    @Body('conversation_id') conversationId?: string,
  ) {
    if (!file) throw new BadRequestException('No file provided.');
    if (!tenantId) throw new BadRequestException('Missing X-Tenant-ID header.');
    if (!category) throw new BadRequestException('Missing category field.');

    return this.filesService.upload(
      tenantId,
      category,
      file.originalname,
      file.buffer,
      file.mimetype,
      user.id,
      workspaceId,
      clientId,
      caseId,
      conversationId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata by ID' })
  findById(@Param('id') id: string) {
    return this.filesService.findById(id);
  }

  @Get(':id/intelligence')
  @ApiOperation({ summary: 'Get file AI intelligence details' })
  getIntelligence(@Param('id') id: string) {
    return this.filesService.getIntelligence(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file' })
  delete(@Param('id') id: string) {
    return this.filesService.delete(id);
  }

  @Get(':id/download-url')
  @ApiOperation({ summary: 'Get pre-signed download URL' })
  getDownloadUrl(@Param('id') id: string) {
    return this.filesService.getDownloadUrl(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download file content directly' })
  async download(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const { buffer, file } = await this.filesService.downloadContent(id);
    res.set({
      'Content-Type': file.fileType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
    });
    return new StreamableFile(buffer);
  }

  @Post('presigned-upload')
  @ApiOperation({ summary: 'Get pre-signed upload URL' })
  getPresignedUpload(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { filename: string; category: string; expires_in?: number },
  ) {
    if (!tenantId) throw new BadRequestException('Missing X-Tenant-ID header.');
    return this.filesService.getPresignedUploadUrl(
      tenantId,
      body.category,
      body.filename,
      body.expires_in || 3600,
    );
  }
}
