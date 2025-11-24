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
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Agendamentos')
@Controller('schedules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo agendamento' })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  create(@Body() createScheduleDto: CreateScheduleDto, @Request() req) {
    return this.schedulesService.create(createScheduleDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar agendamentos do usuário autenticado' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Filtrar por data (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'service',
    required: false,
    description: 'Filtrar por tipo de serviço',
  })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos' })
  findAll(
    @Request() req,
    @Query('date') date?: string,
    @Query('service') service?: string,
  ) {
    const filters: any = {};
    if (date) filters.date = date;
    if (service) filters.service = service;
    return this.schedulesService.findAll(req.user.id, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um agendamento específico' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Agendamento encontrado' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.schedulesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um agendamento' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Agendamento atualizado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Request() req,
  ) {
    return this.schedulesService.update(id, updateScheduleDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um agendamento' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Agendamento removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.schedulesService.remove(id, req.user.id);
  }
}
