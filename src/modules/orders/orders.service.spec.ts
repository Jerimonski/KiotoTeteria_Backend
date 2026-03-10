import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from 'prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;

  const mockPrisma = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest
      .fn()
      .mockImplementation((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = {
      customerEmail: 'admin@kioto.com',
      items: [{ productId: 1, quantity: 2 }],
    };

    it('debería lanzar BadRequest si no hay items', async () => {
      await expect(
        service.create({ customerEmail: 'a@a.com', items: [] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería crear una orden exitosamente calculando el total', async () => {
      const mockProduct = {
        id: 1,
        price: new Prisma.Decimal(5000),
        stock: 10,
        name: 'Té de prueba',
      };

      mockPrisma.product.findMany.mockResolvedValue([mockProduct]);
      mockPrisma.order.create.mockResolvedValue({
        id: 1,
        customerEmail: dto.customerEmail,
        total: new Prisma.Decimal(10000),
        status: OrderStatus.PENDING,
      });

      const result = await service.create(dto);

      expect(result.id).toBe(1);
      expect(mockPrisma.order.create).toHaveBeenCalled();
      expect(mockPrisma.product.update).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si el producto no existe', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException si no hay stock suficiente', async () => {
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 1, price: new Prisma.Decimal(5000), stock: 1 },
      ]);
      await expect(service.create(dto)).rejects.toThrow(
        'Insufficient stock for product 1',
      );
    });
  });

  describe('findAll', () => {
    it('debería retornar datos paginados y metadatos', async () => {
      mockPrisma.order.findMany.mockResolvedValue([{ id: 1 }]);
      mockPrisma.order.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, pageSize: 10 });

      expect(result.data).toBeDefined();
      expect(result.meta.totalItems).toBe(1);
    });
  });

  describe('updateStatus', () => {
    it('debería lanzar NotFound si la orden no existe', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(service.updateStatus(1, OrderStatus.PAID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería actualizar el estado correctamente', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.order.update.mockResolvedValue({
        id: 1,
        status: OrderStatus.PAID,
      });

      const result = await service.updateStatus(1, OrderStatus.PAID);
      expect(result.status).toBe(OrderStatus.PAID);
    });
  });

  describe('findOne', () => {
    it('debería retornar una orden si existe', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({
        id: 1,
        customerEmail: 'a@a.com',
      });
      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('debería lanzar NotFound si la orden no existe', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });
});
