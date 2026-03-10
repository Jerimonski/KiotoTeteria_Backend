import { JwtStrategy } from './jwt.strategy';
import { Test, TestingModule } from '@nestjs/testing';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'testsecret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('debería estar definida', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('debería retornar el payload tal cual (bypass)', async () => {
      const payload = {
        sub: '123',
        email: 'email@example.com',
        role: 'admin',
      };

      const result = await strategy.validate(payload);

      expect(result).toBe(payload);
      expect(result.sub).toBe('123');
    });
  });
});
