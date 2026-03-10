import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderStatus } from '@prisma/client';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrdersService = {
    create: jest.fn().mockResolvedValue({ id: 1, total: 100 }),
    updateStatus: jest
      .fn()
      .mockResolvedValue({ id: 1, status: OrderStatus.PAID }),
    findOne: jest.fn().mockResolvedValue({ id: 1, total: 100 }),
    findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockOrdersService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('debería llamar a create con el DTO correcto', async () => {
    const dto = { customerEmail: 'test@test.com', items: [] };
    await controller.create(dto as any);
    expect(mockOrdersService.create).toHaveBeenCalledWith(dto);
  });

  it('debería llamar a updateStatus con ID y status', async () => {
    const id = 1;
    const dto = { status: OrderStatus.DELIVERED };
    await controller.updateStatus(id, dto);
    expect(mockOrdersService.updateStatus).toHaveBeenCalledWith(id, dto.status);
  });

  it('debería llamar a findAll con los parámetros de query', async () => {
    await controller.findAll(2, 5, OrderStatus.PENDING, 'test@test.com');
    expect(mockOrdersService.findAll).toHaveBeenCalledWith({
      page: 2,
      pageSize: 5,
      status: OrderStatus.PENDING,
      customerEmail: 'test@test.com',
    });
  });
});
