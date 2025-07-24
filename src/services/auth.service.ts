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
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const newPayload = { sub: payload.sub, email: payload.email, nome: payload.nome };
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
}
