import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Roles } from '../auth/roles.decorator';
import { RequirePermissions } from '../auth/permissions.decorator';
import { Role } from '../auth/roles.enum';
import { UsersService } from './users.service';

@ApiTags('Usuários')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obter dados do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getMe(@Request() req) {
    return this.usersService.getMe(req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @RequirePermissions('user_read')
  @ApiOperation({
    summary: 'Listar todos os usuários (Admin + Permissão user_read)',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  @ApiResponse({
    status: 403,
    description:
      'Proibido, usuário não tem permissão para acessar esta lista de usuários',
  })
  async findAll() {
    return this.usersService.findAll();
  }
}
