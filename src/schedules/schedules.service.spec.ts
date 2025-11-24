import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { WebhookService } from '../webhook/webhook.service';

describe('SchedulesService', () => {
  let service: SchedulesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    pet: {
      findUnique: jest.fn(),
    },
    schedule: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockWebhookService = {
    notifyStatusChange: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: WebhookService,
          useValue: mockWebhookService,
        },
      ],
    }).compile();

    service = module.get<SchedulesService>(SchedulesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('listWithFilters', () => {
    it('deve filtrar agendamentos por data', async () => {
      const mockSchedules = [
        {
          id: 1,
          date: new Date('2024-12-25T10:00:00Z'),
          service: 'Consulta',
          status: 'PENDING',
          pet: {
            id: 1,
            name: 'Rex',
            owner: {
              id: 1,
              email: 'usuario@example.com',
              name: 'João Silva',
            },
          },
        },
      ];

      mockPrismaService.schedule.findMany.mockResolvedValue(mockSchedules);

      const result = await service.findAll(1, { date: '2024-12-25' });

      expect(result).toEqual(mockSchedules);
      expect(mockPrismaService.schedule.findMany).toHaveBeenCalled();
    });

    it('deve filtrar agendamentos por serviço', async () => {
      const mockSchedules = [
        {
          id: 1,
          date: new Date('2024-12-25T10:00:00Z'),
          service: 'Consulta',
          status: 'PENDING',
          pet: {
            id: 1,
            name: 'Rex',
            owner: {
              id: 1,
              email: 'usuario@example.com',
              name: 'João Silva',
            },
          },
        },
      ];

      mockPrismaService.schedule.findMany.mockResolvedValue(mockSchedules);

      const result = await service.findAll(1, { service: 'Consulta' });

      expect(result).toEqual(mockSchedules);
      expect(mockPrismaService.schedule.findMany).toHaveBeenCalled();
    });
  });
});
