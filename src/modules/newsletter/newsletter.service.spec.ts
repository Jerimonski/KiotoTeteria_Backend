import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterService } from './newsletter.service';
import { PrismaService } from 'prisma/prisma.service';
import { ConflictException } from '@nestjs/common';

describe('NewsletterService', () => {
  let service: NewsletterService;
  let prisma: PrismaService;

  const mockPrismaService = {
    newsletterSubscriber: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsletterService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NewsletterService>(NewsletterService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscribe', () => {
    const dto = { email: 'test@example.com' };

    it('debería suscribir un nuevo email correctamente', async () => {
      mockPrismaService.newsletterSubscriber.findUnique.mockResolvedValue(null);
      mockPrismaService.newsletterSubscriber.create.mockResolvedValue({
        id: 1,
        ...dto,
      });

      const result = await service.subscribe(dto);

      expect(result).toHaveProperty('id');
      expect(
        mockPrismaService.newsletterSubscriber.create,
      ).toHaveBeenCalledWith({
        data: { email: dto.email },
      });
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      mockPrismaService.newsletterSubscriber.findUnique.mockResolvedValue({
        id: 1,
        ...dto,
      });

      await expect(service.subscribe(dto)).rejects.toThrow(ConflictException);
      expect(
        mockPrismaService.newsletterSubscriber.create,
      ).not.toHaveBeenCalled();
    });
  });
});
