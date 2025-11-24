import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AuditService } from '../audit/audit.service';
import { WebhookService } from '../webhook/webhook.service';

@Injectable()
export class SchedulesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private webhookService: WebhookService,
  ) {}

  async create(createScheduleDto: CreateScheduleDto, userId: number) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: createScheduleDto.petId },
    });

    if (!pet) {
      throw new NotFoundException('Pet não encontrado');
    }

    if (pet.ownerId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para criar agendamento para este pet',
      );
    }

    const schedule = await this.prisma.schedule.create({
      data: {
        date: new Date(createScheduleDto.date),
        service: createScheduleDto.service,
        status: createScheduleDto.status || 'PENDING',
        observations: createScheduleDto.observations,
        petId: createScheduleDto.petId,
      },
      include: {
        pet: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    await this.auditService.log({
      action: 'CREATE_SCHEDULE',
      details: { scheduleId: schedule.id, petId: schedule.petId },
      userId,
    });

    return schedule;
  }

  async findAll(userId: number, filters?: { date?: string; service?: string }) {
    const where: any = {
      pet: {
        ownerId: userId,
      },
    };

    if (filters?.date) {
      const filterDate = new Date(filters.date);
      const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (filters?.service) {
      where.service = filters.service;
    }

    return this.prisma.schedule.findMany({
      where,
      include: {
        pet: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findOne(id: number, userId: number) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        pet: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    if (schedule.pet.ownerId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este agendamento',
      );
    }

    return schedule;
  }

  async update(
    id: number,
    updateScheduleDto: UpdateScheduleDto,
    userId: number,
  ) {
    const schedule = await this.findOne(id, userId);
    const oldStatus = schedule.status;

    const updateData: any = {};
    if (updateScheduleDto.date) {
      updateData.date = new Date(updateScheduleDto.date);
    }
    if (updateScheduleDto.service) {
      updateData.service = updateScheduleDto.service;
    }
    if (updateScheduleDto.status) {
      updateData.status = updateScheduleDto.status;
    }
    if (updateScheduleDto.observations !== undefined) {
      updateData.observations = updateScheduleDto.observations;
    }

    const updatedSchedule = await this.prisma.schedule.update({
      where: { id },
      data: updateData,
      include: {
        pet: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    await this.auditService.log({
      action: 'UPDATE_SCHEDULE',
      details: {
        scheduleId: updatedSchedule.id,
        oldStatus,
        newStatus: updatedSchedule.status,
        changes: updateScheduleDto,
      },
      userId,
    });

    if (updateScheduleDto.status && oldStatus !== updateScheduleDto.status) {
      await this.webhookService.notifyStatusChange({
        scheduleId: updatedSchedule.id,
        oldStatus,
        newStatus: updateScheduleDto.status,
      });
    }

    return updatedSchedule;
  }

  async remove(id: number, userId: number) {
    const schedule = await this.findOne(id, userId);

    await this.prisma.schedule.delete({
      where: { id },
    });

    await this.auditService.log({
      action: 'DELETE_SCHEDULE',
      details: { scheduleId: id, petId: schedule.petId },
      userId,
    });

    return { message: 'Agendamento removido com sucesso' };
  }
}
