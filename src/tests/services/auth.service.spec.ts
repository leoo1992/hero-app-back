import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../services/auth.service';

const mockHero = {
  id: 1,
  email: 'hero@example.com',
  nome: 'Super Hero',
  senha: bcrypt.hashSync('senha123', 10),
  acesso: 'admin',
};

const mockHeroService = {
  findByEmail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    authService = new AuthService(mockHeroService as any, mockJwtService as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve retornar tokens se email e senha forem válidos', async () => {
      mockHeroService.findByEmail.mockResolvedValue(mockHero);
      jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(true);
      mockJwtService.sign.mockReturnValueOnce('accessToken').mockReturnValueOnce('refreshToken');

      const result = await authService.login({ email: mockHero.email, senha: 'senha123' });

      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        nome: mockHero.nome,
        acesso: mockHero.acesso,
        email: mockHero.email,
      });
    });

    it('deve lançar UnauthorizedException se email for inválido', async () => {
      mockHeroService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'invalido@example.com', senha: '123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se a senha for inválida', async () => {
      mockHeroService.findByEmail.mockResolvedValue(mockHero);
      jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(false);

      await expect(
        authService.login({ email: mockHero.email, senha: 'senhaErrada' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('deve retornar novos tokens se o refreshToken for válido', async () => {
      const payload = { sub: mockHero.id, email: mockHero.email, nome: mockHero.nome };
      mockJwtService.verify.mockReturnValue(payload);
      mockJwtService.sign
        .mockReturnValueOnce('newAccessToken')
        .mockReturnValueOnce('newRefreshToken');

      const result = await authService.refreshTokens('validRefreshToken');

      expect(mockJwtService.verify).toHaveBeenCalledWith('validRefreshToken');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ accessToken: 'newAccessToken', refreshToken: 'newRefreshToken' });
    });

    it('deve lançar UnauthorizedException se o refreshToken for inválido', async () => {
      const loggerSpy = jest.spyOn(authService['logger'], 'warn').mockImplementation(() => {});
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      await expect(authService.refreshTokens('invalidToken')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(loggerSpy).toHaveBeenCalledWith('Refresh token inválido', expect.any(Error));
    });
  });

  describe('decodeToken', () => {
    it('deve decodificar o token corretamente', () => {
      const decoded = { sub: 1, email: 'test@example.com' };
      mockJwtService.decode.mockReturnValue(decoded);

      const result = authService.decodeToken('someToken');
      expect(result).toEqual(decoded);
    });

    it('deve retornar null se ocorrer erro na decodificação', () => {
      mockJwtService.decode.mockImplementation(() => {
        throw new Error('Erro ao decodificar');
      });

      const result = authService.decodeToken('badToken');
      expect(result).toBeNull();
    });
  });

  describe('verifyToken', () => {
    it('deve retornar os dados do payload se o token for válido', async () => {
      const payload = {
        nome: 'Test Hero',
        email: 'test@hero.com',
        acesso: 'ADMIN',
      };

      mockJwtService.verify.mockReturnValue(payload);

      const result = await authService.verifyToken('valid-token');

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual({
        nome: payload.nome,
        email: payload.email,
        acesso: payload.acesso,
      });
    });

    it('deve lançar UnauthorizedException se o token for inválido', async () => {
      const loggerSpy = jest.spyOn(authService['logger'], 'warn').mockImplementation(() => {});

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      await expect(authService.verifyToken('invalid-token')).rejects.toThrow(UnauthorizedException);
      expect(loggerSpy).toHaveBeenCalledWith('Token inválido', expect.any(Error));
    });
  });
});
