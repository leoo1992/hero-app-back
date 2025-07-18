import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/controllers/auth.controller';
import { AuthService } from '../../../src/services/auth.service';
import { JwtBlacklistService } from '../../../src/services/jwt-blacklist.service';
import { UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';

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
      });

      const resultado = await controller.login(dto, res);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refresh123', expect.any(Object));
      expect(resultado).toEqual({
        access_token: 'access123',
        refresh_token: 'refresh123',
      });
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
});
