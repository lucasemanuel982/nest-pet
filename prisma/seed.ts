import { PrismaClient, Role } from '@prisma/client';
import { Logger } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const logger = new Logger();

async function main() {
  logger.log('Iniciando seed...');

  // Criar permissões
  const permissions = [
    { slug: 'user_create', description: 'Criar usuários' },
    { slug: 'user_read', description: 'Ler usuários' },
    { slug: 'user_update', description: 'Atualizar usuários' },
    { slug: 'user_delete', description: 'Deletar usuários' },
    { slug: 'pet_create', description: 'Criar pets' },
    { slug: 'pet_read', description: 'Ler pets' },
    { slug: 'pet_update', description: 'Atualizar pets' },
    { slug: 'pet_delete', description: 'Deletar pets' },
    { slug: 'schedule_create', description: 'Criar agendamentos' },
    { slug: 'schedule_read', description: 'Ler agendamentos' },
    { slug: 'schedule_update', description: 'Atualizar agendamentos' },
    { slug: 'schedule_delete', description: 'Deletar agendamentos' },
    { slug: 'audit_read', description: 'Ler logs de auditoria' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  logger.log('Permissões criadas.');

  // Obter todas as permissões para atribuir ao admin/teste
  const allPermissions = await prisma.permission.findMany();

  // Criar usuário Admin com todas as permissões
  const salt1 = await bcrypt.genSalt(10);
  const hashedPassword1 = await bcrypt.hash('senha123', salt1);

  const user = await prisma.user.upsert({
    where: { email: 'usuario@example.com' },
    update: {
      role: Role.ADMIN,
      permissions: {
        set: [], // Limpa anteriores para evitar duplicação no connect
        connect: allPermissions.map((p) => ({ id: p.id })),
      },
    },
    create: {
      email: 'usuario@example.com',
      password: hashedPassword1,
      name: 'João Silva',
      role: Role.ADMIN,
      permissions: {
        connect: allPermissions.map((p) => ({ id: p.id })),
      },
    },
  });

  logger.log(`Usuário criado/atualizado com permissões: ${user.email}`);

  // Criar usuário com permissões apenas de leitura (GET) para pets e schedules
  const readOnlyPermissions = await prisma.permission.findMany({
    where: {
      slug: {
        in: ['pet_read', 'schedule_read'],
      },
    },
  });

  const salt2 = await bcrypt.genSalt(10);
  const hashedPassword2 = await bcrypt.hash('senha123', salt2);

  const readOnlyUser = await prisma.user.upsert({
    where: { email: 'leitor@example.com' },
    update: {
      role: Role.USER,
      permissions: {
        set: [], // Limpa anteriores para evitar duplicação no connect
        connect: readOnlyPermissions.map((p) => ({ id: p.id })),
      },
    },
    create: {
      email: 'leitor@example.com',
      password: hashedPassword2,
      name: 'Maria Leitora',
      role: Role.USER,
      permissions: {
        connect: readOnlyPermissions.map((p) => ({ id: p.id })),
      },
    },
  });

  logger.log(
    `Usuário somente leitura criado/atualizado: ${readOnlyUser.email}`,
  );

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
