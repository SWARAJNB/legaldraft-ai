import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VersionsService } from './versions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/auth.decorators';

@ApiTags('Versions')
@Controller('drafts/:draftId/versions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Get()
  @ApiOperation({ summary: 'List version history for a draft' })
  findAll(@Param('draftId') draftId: string) {
    return this.versionsService.findByDraftId(draftId);
  }

  @Post()
  @ApiOperation({ summary: 'Save a new version' })
  create(
    @Param('draftId') draftId: string,
    @Body() dto: { content: string; change_note?: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.versionsService.createVersion(
      draftId, dto.content, user.id, dto.change_note,
    );
  }

  @Post(':versionId/restore')
  @ApiOperation({ summary: 'Restore a previous version (creates new version)' })
  restore(
    @Param('draftId') draftId: string,
    @Param('versionId') versionId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.versionsService.restore(draftId, versionId, user.id);
  }
}
