import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService) {}

  async create(createPetDto: CreatePetDto, userId: number) {
    return this.prisma.pet.create({
      data: {
        ...createPetDto,
        ownerId: userId,
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
  }

  async findAll(userId: number) {
    return this.prisma.pet.findMany({
      where: {
        ownerId: userId,
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
  }

  async findOne(id: number, userId: number) {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
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

    if (!pet) {
      throw new NotFoundException('Pet não encontrado');
    }

    if (pet.ownerId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este pet',
      );
    }

    return pet;
  }

  async update(id: number, updatePetDto: UpdatePetDto, userId: number) {
    const pet = await this.findOne(id, userId);

    return this.prisma.pet.update({
      where: { id },
      data: updatePetDto,
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
  }

  async remove(id: number, userId: number) {
    const pet = await this.findOne(id, userId);

    return this.prisma.pet.delete({
      where: { id },
    });
  }
}
