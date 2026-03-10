import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('debería estar definido', () => {
    expect(new JwtAuthGuard()).toBeDefined();
  });
});
