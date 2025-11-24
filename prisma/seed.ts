import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const logger = new Logger();

async function main() {
  logger.log('Iniciando seed...');

  // Criar usuário
  const salt1 = await bcrypt.genSalt(10);
  const hashedPassword1 = await bcrypt.hash('senha123', salt1);

  const user = await prisma.user.upsert({
    where: { email: 'usuario@example.com' },
    update: {},
    create: {
      email: 'usuario@example.com',
      password: hashedPassword1,
      name: 'João Silva',
    },
  });

  logger.log(`Usuário criado: ${user.email}`);

  // Criar pets
  const pet1 = await prisma.pet.create({
    data: {
      name: 'Rex',
      species: 'Dog',
      age: 3,
      weight: 15.5,
      observations: 'Pet muito brincalhão',
      ownerId: user.id,
    },
  });

  const pet2 = await prisma.pet.create({
    data: {
      name: 'Mimi',
      species: 'Cat',
      age: 2,
      weight: 4.2,
      observations: 'Gata muito carinhosa',
      ownerId: user.id,
    },
  });

  logger.log(`Pets criados: ${pet1.name}, ${pet2.name}`);

  // Criar agendamentos
  const schedule1 = await prisma.schedule.create({
    data: {
      date: new Date('2024-12-25T10:00:00Z'),
      service: 'Consulta',
      status: 'PENDING',
      observations: 'Primeira consulta do pet',
      petId: pet1.id,
    },
  });

  const schedule2 = await prisma.schedule.create({
    data: {
      date: new Date('2024-12-30T14:00:00Z'),
      service: 'Vacinação',
      status: 'CONFIRMED',
      observations: 'Vacinação anual',
      petId: pet2.id,
    },
  });

  logger.log(`Agendamentos criados: ${schedule1.id}, ${schedule2.id}`);
  logger.log('Seed concluído!');
}

main()
  .catch((e) => {
    logger.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
