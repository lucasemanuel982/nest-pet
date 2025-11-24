import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const loginDto = {
        email: 'usuario@example.com',
        password: 'senha123',
      };

      const hashedPassword = await bcrypt.hash('senha123', 10);
      const mockUser = {
        id: 1,
        email: 'usuario@example.com',
        password: hashedPassword,
        name: 'João Silva',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginDto.email);
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('deve lançar exceção com credenciais inválidas', async () => {
      const loginDto = {
        email: 'usuario@example.com',
        password: 'senhaErrada',
      };

      const hashedPassword = await bcrypt.hash('senha123', 10);
      const mockUser = {
        id: 1,
        email: 'usuario@example.com',
        password: hashedPassword,
        name: 'João Silva',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
