import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from 'src/guards/roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockContext: Partial<ExecutionContext> = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () =>
      ({
        getRequest: () => mockContext['request'],
        getResponse: () => ({}),
        getNext: () => ({}),
      }) as any,
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('deve liberar acesso quando não há roles requeridas', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result = guard.canActivate(mockContext as ExecutionContext);

    expect(result).toBe(true);
  });

  it('deve liberar acesso quando o array de roles está vazio', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

    const result = guard.canActivate(mockContext as ExecutionContext);

    expect(result).toBe(true);
  });

  it('deve bloquear acesso quando usuário não tem role necessário', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    mockContext['request'] = {
      user: {
        acesso: 'USER',
      },
    };

    expect(() => guard.canActivate(mockContext as ExecutionContext)).toThrow(ForbiddenException);
  });

  it('deve liberar acesso quando usuário tem role necessário', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);

    mockContext['request'] = {
      user: {
        acesso: 'ADMIN',
      },
    };

    const result = guard.canActivate(mockContext as ExecutionContext);

    expect(result).toBe(true);
  });
});
