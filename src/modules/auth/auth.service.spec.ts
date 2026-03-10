import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrisma = {
    admin: {
      findUnique: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('mock_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const email = 'test@kioto.com';
    const password = 'password123';
    const hashedPassword = 'hashed_password';

    it('debería retornar un access_token si las credenciales son válidas', async () => {
      const mockAdmin = {
        id: 1,
        email,
        passwordHash: hashedPassword,
        isActive: true,
        role: 'ADMIN',
      };

      mockPrisma.admin.findUnique.mockResolvedValue(mockAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(email, password);

      expect(result).toEqual({ access_token: 'mock_token' });
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si el admin no existe', async () => {
      mockPrisma.admin.findUnique.mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar BadRequestException si el password es incorrecto', async () => {
      const mockAdmin = {
        id: 1,
        email,
        passwordHash: hashedPassword,
        isActive: true,
      };

      mockPrisma.admin.findUnique.mockResolvedValue(mockAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(email, password)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('debería lanzar BadRequestException si el admin no está activo', async () => {
      const mockAdmin = {
        id: 1,
        email,
        passwordHash: hashedPassword,
        isActive: false,
      };

      mockPrisma.admin.findUnique.mockResolvedValue(mockAdmin);

      await expect(service.login(email, password)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
