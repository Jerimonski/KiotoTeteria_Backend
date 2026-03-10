import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn().mockResolvedValue({ access_token: 'fake_token' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('debería llamar a authService.login con los parámetros correctos', async () => {
    const dto: LoginDto = { email: 'admin@kioto.com', password: '123' };
    const result = await controller.login(dto);

    expect(service.login).toHaveBeenCalledWith(dto.email, dto.password);
    expect(result).toEqual({ access_token: 'fake_token' });
  });
});
