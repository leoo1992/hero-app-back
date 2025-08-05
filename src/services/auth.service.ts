import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { HeroService } from './hero.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/dtos/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly heroService: HeroService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const hero = await this.heroService.findByEmail(dto.email.toLowerCase().trim());

    if (!hero) throw new UnauthorizedException('Email ou senha inválidos');

    const senhaValida = await bcrypt.compare(dto.senha, hero.senha);

    if (!senhaValida) throw new UnauthorizedException('Email ou senha inválidos');

    const payload = {
      sub: hero.id,
      email: hero.email,
      nome: hero.nome,
      acesso: hero.acesso,
      hero: hero.hero,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      nome: hero.nome,
      acesso: hero.acesso,
      email: hero.email,
      usuario: {
        id: hero.id,
        nome: hero.nome,
        email: hero.email,
        acesso: hero.acesso,
        hero: hero.hero,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        nome: payload.nome,
        hero: payload.hero,
      };
      const accessToken = this.jwtService.sign(newPayload, { expiresIn: '1h' });
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      return { accessToken, refreshToken: newRefreshToken };
    } catch (e) {
      this.logger.warn('Refresh token inválido', e);
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  decodeToken(token: string): any {
    try {
      return this.jwtService.decode(token);
    } catch {
      return null;
    }
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      const hero = await this.heroService.findById(payload.sub);
      if (!hero) throw new UnauthorizedException('Usuário não encontrado');

      return {
        id: hero.id,
        nome: hero.nome,
        email: hero.email,
        acesso: hero.acesso,
        hero: hero.hero,
      };
    } catch (error) {
      this.logger.warn('Token inválido', error);
      throw new UnauthorizedException('Token inválido');
    }
  }
}
