import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtToken: string;
  let petId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    prisma = app.get(PrismaService);
    await app.init();

    // Limpeza prévia para evitar conflitos de teste
    // CUIDADO: UTILIZAR SOMENTE EM AMBIENTE DE TESTE.
    // await prisma.schedule.deleteMany();
    // await prisma.pet.deleteMany();
    // await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('Fluxo Completo', () => {
    const mockUser = {
      email: `e2e_${Date.now()}@test.com`,
      password: 'password123',
      name: 'E2E User',
    };

    // 1. Autenticação
    describe('Auth', () => {
      it('/auth/register (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send(mockUser)
          .expect(201);

        expect(res.body.email).toBe(mockUser.email);
      });

      it('/auth/login (POST)', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: mockUser.email,
            password: mockUser.password,
          })
          .expect(201); // Ajuste para 200 se seu controller retornar 200

        jwtToken = res.body.access_token;
        expect(jwtToken).toBeDefined();
      });
    });

    // 2. Usuários (Necessita Token)
    describe('Users', () => {
      it('/users/me (GET) - Deve retornar perfil do usuário logado', () => {
        return request(app.getHttpServer())
          .get('/users/me')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.email).toBe(mockUser.email);
          });
      });
    });

    // 3. Pets (Necessita Token)
    describe('Pets', () => {
      it('/pets (POST) - Deve criar um pet', async () => {
        const res = await request(app.getHttpServer())
          .post('/pets')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            name: 'Rex',
            species: 'Dog',
            age: 5,
            weight: 12.5,
          })
          .expect(201);

        petId = res.body.id;
        expect(res.body.name).toBe('Rex');
      });

      it('/pets (GET) - Deve listar pets do usuário', () => {
        return request(app.getHttpServer())
          .get('/pets')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].name).toBe('Rex');
          });
      });
    });

    // 4. Agendamentos (Necessita Token)
    describe('Schedules', () => {
      it('/schedules (POST) - Deve agendar um serviço', () => {
        return request(app.getHttpServer())
          .post('/schedules')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({
            petId: petId,
            service: 'Banho e Tosa',
            date: new Date().toISOString(),
          })
          .expect(201)
          .expect((res) => {
            expect(res.body.service).toBe('Banho e Tosa');
            expect(res.body.petId).toBe(petId);
          });
      });

      it('/schedules (GET) - Deve listar agendamentos', () => {
        return request(app.getHttpServer())
          .get('/schedules')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
          });
      });
    });
  });
});
