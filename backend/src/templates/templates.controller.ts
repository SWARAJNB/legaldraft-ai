import { Controller, Get, Post, Param, Body, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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
  findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.templatesService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  findById(@Param('id') id: string) {
    return this.templatesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a custom template' })
  create(
    @Body() dto: any,
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.templatesService.create(tenantId || 'default', user.id, dto);
  }
}
