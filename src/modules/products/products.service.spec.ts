import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  const mockPrisma = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debería retornar una lista de productos y metadata de paginación', async () => {
      const mockProducts = [{ id: 1, name: 'Té Verde', slug: 'te-verde' }];
      const mockCount = 1;

      mockPrisma.$transaction.mockResolvedValue([mockProducts, mockCount]);

      const result = await service.findAll({ page: 1, pageSize: 10 });

      expect(result).toEqual({
        data: mockProducts,
        meta: {
          total: mockCount,
          page: 1,
          lastPage: 1,
        },
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('findByCategory', () => {
    it('debería retornar productos filtrados por categoría', async () => {
      const mockProducts = [{ id: 1, categoryId: 5 }];
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findByCategory(5);
      expect(result).toEqual(mockProducts);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { categoryId: 5 },
      });
    });
  });

  describe('findOne', () => {
    it('debería retornar un producto si existe', async () => {
      const mockProduct = { id: 1, name: 'Té' };
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);
      expect(result).toEqual(mockProduct);
    });

    it('debería lanzar NotFoundException si el producto no existe', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      name: 'Nuevo Producto',
      slug: 'nuevo-producto',
      description: 'Desc',
      price: new Prisma.Decimal(15.5),
      categoryId: 1,
    };

    it('debería crear un producto exitosamente', async () => {
      mockPrisma.product.create.mockResolvedValue({ id: 1, ...createDto });

      const result = await service.create(createDto);
      expect(result.id).toBe(1);
      expect(mockPrisma.product.create).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si el slug ya existe (Error P2002)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.x',
        },
      );

      mockPrisma.product.create.mockRejectedValue(prismaError);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería re-lanzar cualquier otro error no manejado', async () => {
      mockPrisma.product.create.mockRejectedValue(new Error('Generic Error'));
      await expect(service.create(createDto)).rejects.toThrow(Error);
    });
  });

  describe('updateStatus', () => {
    it('debería actualizar el estado isActive de un producto', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.product.update.mockResolvedValue({ id: 1, isActive: false });

      const result = await service.updateStatus(1, false);
      expect(result.isActive).toBe(false);
    });

    it('debería lanzar NotFoundException si el producto a actualizar no existe', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.updateStatus(1, true)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar un producto', async () => {
      mockPrisma.product.delete.mockResolvedValue({ id: 1 });
      const result = await service.remove(1);
      expect(result.id).toBe(1);
    });
  });
});
