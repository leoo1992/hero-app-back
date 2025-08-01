import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/controllers/auth.controller';
import { AuthService } from '../../../src/services/auth.service';
import { JwtBlacklistService } from '../../../src/services/jwt-blacklist.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { AcessoType } from 'src/@types/hero/acessoType';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let jwtBlacklistService: jest.Mocked<JwtBlacklistService>;

  const mockResponse = () => {
    const res = {} as Response;
    res.cookie = jest.fn().mockReturnThis();
    res.clearCookie = jest.fn().mockReturnThis();
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            refreshTokens: jest.fn(),
            decodeToken: jest.fn(),
          },
        },
        {
          provide: JwtBlacklistService,
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    jwtBlacklistService = module.get(JwtBlacklistService);
  });

  describe('login', () => {
    it('deve retornar os tokens e definir cookie', async () => {
      const dto = { email: 'teste@teste.com', senha: '123456' };
      const res = mockResponse();
      authService.login.mockResolvedValue({
        accessToken: 'access123',
        refreshToken: 'refresh123',
        nome: 'Super Hero',
        email: 'superhero@hero.com',
        acesso: AcessoType.ADMIN,
      });

      const resultado = await controller.login(dto, res);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refresh123', expect.any(Object));
      expect(resultado).toEqual({
        access_token: 'access123',
        refresh_token: 'refresh123',
        nome: 'Super Hero',
        acesso: AcessoType.ADMIN,
        email: 'superhero@hero.com',
      });
    });

    it('deve lançar UnauthorizedException se payload do refresh token for inválido', async () => {
      const req = {
        cookies: { refresh_token: 'refresh123' },
        headers: {},
      } as unknown as Request;
      const res = mockResponse();

      authService.decodeToken.mockReturnValue(null);

      await controller.logout(req, res);
      expect(jwtBlacklistService.add).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se access token for vazio', async () => {
      const req = {
        cookies: {},
        headers: { authorization: 'Bearer ' },
      } as unknown as Request;
      const res = mockResponse();

      await expect(controller.logout(req, res)).rejects.toThrow(BadRequestException);
    });

    it('deve logar aviso se authorization header estiver ausente', async () => {
      const req = {
        cookies: {},
        headers: {},
      } as unknown as Request;
      const res = mockResponse();

      const loggerSpy = jest.spyOn<any, any>(controller['logger'], 'warn');

      await controller.logout(req, res);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Nenhum token de acesso encontrado no cabeçalho Authorization',
      );
      loggerSpy.mockRestore();
    });
  });

  describe('refresh', () => {
    it('deve retornar novo access token e atualizar o cookie', async () => {
      const req = {
        cookies: { refresh_token: 'refresh123' },
      } as unknown as Request;

      const res = mockResponse();
      authService.refreshTokens.mockResolvedValue({
        accessToken: 'novoAccess',
        refreshToken: 'novoRefresh',
      });

      const resultado = await controller.refresh(req, res);

      expect(authService.refreshTokens).toHaveBeenCalledWith('refresh123');
      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'novoRefresh', expect.any(Object));
      expect(resultado).toEqual({ access_token: 'novoAccess' });
    });

    it('deve lançar UnauthorizedException se refresh_token estiver ausente', async () => {
      const req = { cookies: {} } as Request;
      const res = mockResponse();

      await expect(controller.refresh(req, res)).rejects.toThrow(UnauthorizedException);
    });

    it('deve logar aviso se access token já estiver expirado', async () => {
      const req = {
        cookies: {},
        headers: { authorization: 'Bearer access123' },
      } as unknown as Request;

      const res = mockResponse();

      const expiredPayload = { exp: Math.floor(Date.now() / 1000) - 10 };
      authService.decodeToken.mockReturnValue(expiredPayload);

      const loggerSpy = jest.spyOn<any, any>(controller['logger'], 'warn');

      const result = await controller.logout(req, res);

      expect(loggerSpy).toHaveBeenCalledWith('Access token já expirado no logout');
      expect(result).toEqual({ message: 'Logout realizado com sucesso' });

      loggerSpy.mockRestore();
    });
  });

  describe('logout', () => {
    it('deve limpar o cookie e adicionar tokens à blacklist', async () => {
      const req = {
        cookies: { refresh_token: 'refresh123' },
        headers: { authorization: 'Bearer access123' },
      } as unknown as Request;

      const res = mockResponse();

      const payload = { exp: Math.floor(Date.now() / 1000) + 60 };
      authService.decodeToken.mockReturnValue(payload);

      const resultado = await controller.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', expect.any(Object));
      expect(authService.decodeToken).toHaveBeenCalledTimes(2);
      expect(jwtBlacklistService.add).toHaveBeenCalledWith('refresh123');
      expect(jwtBlacklistService.add).toHaveBeenCalledWith('access123');
      expect(resultado).toEqual({ message: 'Logout realizado com sucesso' });
    });

    it('não deve lançar erro se os tokens forem inválidos', async () => {
      const req = {
        cookies: { refresh_token: 'invalid' },
        headers: { authorization: 'Bearer invalid' },
      } as unknown as Request;
      const res = mockResponse();

      authService.decodeToken.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      const resultado = await controller.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalled();
      expect(jwtBlacklistService.add).not.toHaveBeenCalled();
      expect(resultado).toEqual({ message: 'Logout realizado com sucesso' });
    });
  });

  it('deve logar aviso se refresh token estiver ausente no handleRefreshToken', async () => {
    const req = {
      cookies: {},
      headers: {},
    } as unknown as Request;

    const loggerSpy = jest.spyOn<any, any>(controller['logger'], 'warn');

    await controller['handleRefreshToken'](req);

    expect(loggerSpy).toHaveBeenCalledWith(
      'Nenhum token de acesso encontrado no cabeçalho Authorization',
    );

    loggerSpy.mockRestore();
  });

  describe('verify', () => {
    it('deve retornar os dados do usuário se o token for válido', async () => {
      const req = {
        headers: { authorization: 'Bearer valid-token' },
      } as unknown as Request;

      authService.verifyToken = jest.fn().mockResolvedValue({
        nome: 'Usuário',
        email: 'user@example.com',
        acesso: AcessoType.ADMIN,
      });

      const result = await controller.verify(req);

      expect(authService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual({
        nome: 'Usuário',
        email: 'user@example.com',
        acesso: AcessoType.ADMIN,
      });
    });

    it('deve lançar UnauthorizedException se o token estiver ausente', async () => {
      const req = {
        headers: {},
      } as unknown as Request;

      await expect(controller.verify(req)).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se o token for inválido', async () => {
      const req = {
        headers: { authorization: 'InvalidToken' },
      } as unknown as Request;

      await expect(controller.verify(req)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('me', () => {
    it('deve retornar os dados do usuário se token estiver no header', async () => {
      const req = {
        headers: { authorization: 'Bearer token-header' },
        cookies: {},
      } as unknown as Request;

      authService.verifyToken = jest.fn().mockResolvedValue({
        nome: 'Hero',
        email: 'hero@email.com',
        acesso: AcessoType.ADMIN,
      });

      const result = await controller.me(req);

      expect(authService.verifyToken).toHaveBeenCalledWith('token-header');
      expect(result).toEqual({
        nome: 'Hero',
        email: 'hero@email.com',
        acesso: AcessoType.ADMIN,
        token: 'token-header',
      });
    });

    it('deve retornar os dados do usuário se token estiver no cookie', async () => {
      const req = {
        headers: {},
        cookies: { refresh_token: 'token-cookie' },
      } as unknown as Request;

      authService.verifyToken = jest.fn().mockResolvedValue({
        nome: 'HeroCookie',
        email: 'cookie@hero.com',
        acesso: AcessoType.HERO,
      });

      const result = await controller.me(req);

      expect(authService.verifyToken).toHaveBeenCalledWith('token-cookie');
      expect(result).toEqual({
        nome: 'HeroCookie',
        email: 'cookie@hero.com',
        acesso: AcessoType.HERO,
        token: 'token-cookie',
      });
    });

    it('deve lançar UnauthorizedException se não houver token no header nem no cookie', async () => {
      const req = {
        headers: {},
        cookies: {},
      } as unknown as Request;

      await expect(controller.me(req)).rejects.toThrow(UnauthorizedException);
    });
  });
});
