import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';

describe('NewsletterController', () => {
  let controller: NewsletterController;
  let service: NewsletterService;

  const mockNewsletterService = {
    subscribe: jest
      .fn()
      .mockResolvedValue({ id: 1, email: 'test@example.com' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsletterController],
      providers: [
        { provide: NewsletterService, useValue: mockNewsletterService },
      ],
    }).compile();

    controller = module.get<NewsletterController>(NewsletterController);
    service = module.get<NewsletterService>(NewsletterService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('debería llamar a newsletterService.subscribe con el DTO', async () => {
    const dto = { email: 'test@example.com' };
    await controller.subscribe(dto);

    expect(mockNewsletterService.subscribe).toHaveBeenCalledWith(dto);
  });
});
