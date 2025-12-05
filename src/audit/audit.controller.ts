import {
  Controller,
  Get,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Roles } from '../auth/roles.decorator';
import { RequirePermissions } from '../auth/permissions.decorator';
import { Role } from '../auth/roles.enum';

@ApiTags('Auditoria')
@Controller('audit')
@UseGuards(RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.ADMIN)
  @RequirePermissions('audit_read')
  @ApiOperation({ summary: 'Listar logs de auditoria' })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de logs de auditoria' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async findAll(
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
  ) {
    return this.auditService.findAll(userId);
  }
}
