import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (
    userRole: string,
    requiredRoles: string[] | null,
  ): ExecutionContext => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: userRole },
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('debería permitir el acceso si no hay roles requeridos (ruta pública)', () => {
    const context = createMockContext('user', null);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('debería permitir el acceso si el usuario tiene el rol requerido', () => {
    const context = createMockContext('admin', ['admin', 'editor']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('debería denegar el acceso si el usuario NO tiene el rol requerido', () => {
    const context = createMockContext('user', ['admin']);
    expect(guard.canActivate(context)).toBe(false);
  });
});
