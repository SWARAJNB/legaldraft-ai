import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DraftsService } from './drafts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/auth.decorators';
import { PermissionsGuard } from '../auth/rbac/permissions.guard';
import { RequirePermission } from '../auth/rbac/permission.decorator';
import { Permission } from '../auth/rbac/permissions';

@ApiTags('Drafts')
@Controller('drafts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission(Permission.DRAFT)
@ApiBearerAuth()
export class DraftsController {
  constructor(private readonly draftsService: DraftsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new draft' })
  create(
    @Body() dto: any,
    @Headers('x-tenant-id') tenantId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.draftsService.create(tenantId || 'default', user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all drafts for tenant' })
  findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.draftsService.findAll(tenantId || 'default');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get draft by ID' })
  findById(@Param('id') id: string) {
    return this.draftsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update draft' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.draftsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete draft' })
  delete(@Param('id') id: string) {
    return this.draftsService.delete(id);
  }
}
