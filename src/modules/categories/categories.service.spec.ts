import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    category: {
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
        CategoriesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = { name: 'Té Verde', isActive: true };

    it('debería crear una categoría y generar el slug correctamente', async () => {
      const expectedCategory = {
        id: 1,
        name: 'Té Verde',
        slug: 'te-verde',
        isActive: true,
      };
      mockPrismaService.category.create.mockResolvedValue(expectedCategory);

      const result = await service.create(createDto as any);

      expect(result.slug).toBe('te-verde');
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: { name: 'Té Verde', slug: 'te-verde', isActive: true },
      });
    });

    it('debería lanzar BadRequestException si el slug ya existe (Error P2002)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint',
        {
          code: 'P2002',
          clientVersion: '5.x',
        },
      );
      mockPrismaService.category.create.mockRejectedValue(prismaError);

      await expect(service.create(createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería relanzar errores genéricos', async () => {
      mockPrismaService.category.create.mockRejectedValue(
        new Error('Unknown Error'),
      );
      await expect(service.create(createDto as any)).rejects.toThrow(
        'Unknown Error',
      );
    });
  });

  describe('findAll', () => {
    it('debería retornar un array de categorías', async () => {
      const mockCategories = [
        { id: 1, name: 'Té' },
        { id: 2, name: 'Accesorios' },
      ];
      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();
      expect(result).toEqual(mockCategories);
      expect(mockPrismaService.category.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debería buscar por ID si el argumento es numérico', async () => {
      const mockCategory = { id: 123, name: 'Test' };
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne('123');
      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 123 },
      });
    });

    it('debería buscar por Slug si el argumento no es numérico', async () => {
      const mockCategory = { id: 1, slug: 'mi-cat' };
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      await service.findOne('mi-cat');
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { slug: 'mi-cat' },
      });
    });

    it('debería lanzar NotFoundException si no encuentra la categoría (Línea 99)', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);
      await expect(service.findOne('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Nombre Nuevo' };

    it('debería actualizar satisfactoriamente', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        id: 1,
        name: 'Viejo',
      });
      mockPrismaService.category.update.mockResolvedValue({
        id: 1,
        name: 'Nombre Nuevo',
        slug: 'nombre-nuevo',
      });

      const result = await service.update(1, updateDto as any);
      expect(result.name).toBe('Nombre Nuevo');
      expect(result.slug).toBe('nombre-nuevo');
    });

    it('debería lanzar NotFoundException si no existe antes de actualizar', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);
      await expect(service.update(99, updateDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar si la categoría existe (Línea 111)', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.category.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1);
      expect(result).toEqual({ id: 1 });
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('debería lanzar NotFoundException si no existe al intentar eliminar', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
