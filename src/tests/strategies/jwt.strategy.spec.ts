import { JwtPayload, JwtStrategy } from '../../strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { JwtBlacklistService } from '../../services/jwt-blacklist.service';
import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;
  let blacklistService: JwtBlacklistService;

  const payload: JwtPayload = {
    sub: 1,
    email: 'teste@hero.com',
    nome: 'Hero Teste',
    acesso: 'HERO',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + 10000) / 1000),
  };

  const token = jwt.sign(payload, 'testsecret');

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('testsecret'),
    } as unknown as ConfigService;

    blacklistService = {
      has: jest.fn().mockResolvedValue(false),
    } as unknown as JwtBlacklistService;

    strategy = new JwtStrategy(configService, blacklistService);
  });

  it('deve retornar o payload se o token for válido e não estiver na blacklist', async () => {
    const mockReq = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as unknown as Request;

    const done = jest.fn();

    await strategy.validate(mockReq, payload, done);

    expect(done).toHaveBeenCalledWith(null, payload);
    expect(blacklistService.has).toHaveBeenCalledWith(token);
  });

  it('deve lançar Unauthorized se token estiver ausente', async () => {
    const mockReq = {
      headers: {},
    } as unknown as Request;

    const done = jest.fn();

    await strategy.validate(mockReq, payload, done);

    expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException), false);
  });

  it('deve lançar Unauthorized se token estiver na blacklist', async () => {
    const mockReq = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as unknown as Request;

    jest.spyOn(blacklistService, 'has').mockResolvedValue(true);

    const done = jest.fn();

    await strategy.validate(mockReq, payload, done);

    expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException), false);
  });

  it('deve lançar erro se JWT_SECRET não estiver definido', () => {
    const config = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    expect(() => new JwtStrategy(config, blacklistService)).toThrow('JWT_SECRET não definido');
  });

  it('deve retornar null se o authorization não for Bearer token', async () => {
    const mockReq = {
      headers: {
        authorization: 'Basic abc123',
      },
    } as unknown as Request;

    const result = (strategy as any).extractTokenFromRequest(mockReq);
    expect(result).toBeNull();
  });

  it('deve retornar null se o token estiver ausente após "Bearer"', async () => {
    const mockReq = {
      headers: {
        authorization: 'Bearer',
      },
    } as unknown as Request;

    const result = (strategy as any).extractTokenFromRequest(mockReq);
    expect(result).toBeNull();
  });
});
