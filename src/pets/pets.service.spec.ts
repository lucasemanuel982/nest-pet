import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PetsService } from './pets.service';
import { PrismaService } from '../database/prisma.service';

describe('PetsService', () => {
  let service: PetsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    pet: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PetsService>(PetsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um pet com sucesso', async () => {
      const createPetDto = {
        name: 'Rex',
        species: 'Dog',
        age: 3,
        weight: 15.5,
        observations: 'Pet brincalhão',
      };

      const mockPet = {
        id: 1,
        ...createPetDto,
        ownerId: 1,
        owner: {
          id: 1,
          email: 'usuario@example.com',
          name: 'João Silva',
        },
      };

      mockPrismaService.pet.create.mockResolvedValue(mockPet);

      const result = await service.create(createPetDto, 1);

      expect(result).toEqual(mockPet);
      expect(mockPrismaService.pet.create).toHaveBeenCalledWith({
        data: {
          ...createPetDto,
          ownerId: 1,
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('deve lançar NotFoundException quando pet não existe', async () => {
      mockPrismaService.pet.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException quando pet não pertence ao usuário', async () => {
      const mockPet = {
        id: 1,
        ownerId: 2,
        name: 'Rex',
        species: 'Dog',
        age: 3,
        weight: 15.5,
      };

      mockPrismaService.pet.findUnique.mockResolvedValue(mockPet);

      await expect(service.findOne(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });
});
