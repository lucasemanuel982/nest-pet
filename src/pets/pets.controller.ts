import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@ApiTags('Pets')
@Controller('pets')
@UseGuards(PermissionsGuard)
@ApiBearerAuth()
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @RequirePermissions('pet_create')
  @ApiOperation({ summary: 'Criar um novo pet' })
  @ApiResponse({ status: 201, description: 'Pet criado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Proibido, usuário não tem permissão para criar pets',
  })
  create(@Body() createPetDto: CreatePetDto, @Request() req) {
    return this.petsService.create(createPetDto, req.user.id);
  }

  @Get()
  @RequirePermissions('pet_read')
  @ApiOperation({ summary: 'Listar todos os pets do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de pets' })
  @ApiResponse({
    status: 403,
    description:
      'Proibido, usuário não tem permissão para acessar esta lista de pets',
  })
  findAll(@Request() req) {
    return this.petsService.findAll(req.user.id);
  }

  @Get(':id')
  @RequirePermissions('pet_read')
  @ApiOperation({ summary: 'Obter um pet específico' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Pet encontrado' })
  @ApiResponse({ status: 404, description: 'Pet não encontrado' })
  @ApiResponse({
    status: 403,
    description: 'Proibido, usuário não tem permissão para acessar este pet',
  })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.petsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @RequirePermissions('pet_update')
  @ApiOperation({ summary: 'Atualizar um pet' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Pet atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pet não encontrado' })
  @ApiResponse({
    status: 403,
    description: 'Proibido, usuário não tem permissão para atualizar pets',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePetDto: UpdatePetDto,
    @Request() req,
  ) {
    return this.petsService.update(id, updatePetDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermissions('pet_delete')
  @ApiOperation({ summary: 'Remover um pet' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Pet removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Pet não encontrado' })
  @ApiResponse({
    status: 403,
    description: 'Proibido, usuário não tem permissão para deletar pets',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.petsService.remove(id, req.user.id);
  }
}
