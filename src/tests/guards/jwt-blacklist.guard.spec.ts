import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtBlacklistGuard } from 'src/guards/jwt-blacklist.guard';
import { JwtBlacklistService } from 'src/services/jwt-blacklist.service';

describe('JwtBlacklistGuard', () => {
  let guard: JwtBlacklistGuard;
  let blacklistService: JwtBlacklistService;

  const mockRequest: any = {};
  const mockContext: Partial<ExecutionContext> = {
    switchToHttp: () =>
      ({
        getRequest: () => mockRequest,
        getResponse: () => ({}),
        getNext: () => ({}),
      }) as any,
  };

  beforeEach(() => {
    blacklistService = {
      isBlacklisted: jest.fn(),
    } as any;
    guard = new JwtBlacklistGuard(blacklistService);
  });

  it('deve lançar erro se o token estiver ausente', async () => {
    mockRequest.headers = {};
    await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow(
      new UnauthorizedException('Token ausente'),
    );
  });

  it('deve lançar erro se o token estiver na blacklist', async () => {
    const token = 'valid.token.here';
    mockRequest.headers = { authorization: `Bearer ${token}` };
    jest.spyOn(blacklistService, 'isBlacklisted').mockResolvedValue(true);

    await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow(
      new UnauthorizedException('Token inválido (logout)'),
    );
  });

  it('deve autorizar se o token for válido e não estiver na blacklist', async () => {
    const tokenPayload = { id: 123 };
    const token = jwt.sign(tokenPayload, 'secret');

    mockRequest.headers = { authorization: `Bearer ${token}` };
    jest.spyOn(blacklistService, 'isBlacklisted').mockResolvedValue(false);

    process.env.JWT_SECRET = 'secret';

    const result = await guard.canActivate(mockContext as ExecutionContext);
    expect(result).toBe(true);
    expect(mockRequest.user).toMatchObject(tokenPayload);
  });

  it('deve lançar erro se o token estiver expirado', async () => {
    const expiredToken = jwt.sign({ id: 1 }, 'secret', { expiresIn: -1 });
    mockRequest.headers = { authorization: `Bearer ${expiredToken}` };
    jest.spyOn(blacklistService, 'isBlacklisted').mockResolvedValue(false);

    await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow(
      new UnauthorizedException('Token expirado'),
    );
  });

  it('deve lançar erro se o token for malformado', async () => {
    mockRequest.headers = { authorization: `Bearer malformed.token` };
    jest.spyOn(blacklistService, 'isBlacklisted').mockResolvedValue(false);

    await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow(
      new UnauthorizedException('Token malformado'),
    );
  });
});
