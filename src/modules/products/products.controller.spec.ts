import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Prisma } from '@prisma/client';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    findAll: jest.fn(),
    findByCategory: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockProductsService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('findAll - debería llamar al servicio con tipos numéricos convertidos', async () => {
    await controller.findAll('2', '5');
    expect(mockProductsService.findAll).toHaveBeenCalledWith({
      page: 2,
      pageSize: 5,
    });
  });

  it('findByCategory - debería llamar al servicio', async () => {
    await controller.findByCategory(5);
    expect(mockProductsService.findByCategory).toHaveBeenCalledWith(5);
  });

  it('findOne - debería llamar al servicio', async () => {
    await controller.findOne(1);
    expect(mockProductsService.findOne).toHaveBeenCalledWith(1);
  });

  it('create - debería enviar el DTO completo al servicio', async () => {
    const dto = {
      name: 'Té Matcha Japonés',
      slug: 'te-matcha-japones',
      description: 'Grado ceremonial',
      price: new Prisma.Decimal(25000),
      categoryId: 1,
    };
    await controller.create(dto as any);
    expect(mockProductsService.create).toHaveBeenCalledWith(dto);
  });

  it('updateStatus - debería enviar id y el valor booleano de isActive', async () => {
    await controller.updateStatus(1, { isActive: false });
    expect(mockProductsService.updateStatus).toHaveBeenCalledWith(1, false);
  });

  it('remove - debería llamar al servicio para eliminar', async () => {
    await controller.remove(1);
    expect(mockProductsService.remove).toHaveBeenCalledWith(1);
  });
});
