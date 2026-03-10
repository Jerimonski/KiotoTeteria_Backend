import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockService = {
    create: jest.fn().mockResolvedValue({ id: 1, name: 'Test' }),
    findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'Test' }]),
    findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Test' }),
    update: jest.fn().mockResolvedValue({ id: 1, name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: 1, name: 'Deleted' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: mockService }],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('debería llamar a findAll', async () => {
    await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('debería llamar a create con el DTO', async () => {
    const dto = { name: 'New' };
    await controller.createCategory(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });
});
