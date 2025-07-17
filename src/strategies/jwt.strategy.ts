import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtBlacklistService } from 'src/services/jwt-blacklist.service';
import { Request } from 'express';

type JwtPayload = {
  sub: number;
  email: string;
  nome: string;
  acesso: 'ADMIN' | 'HERO';
  iat: number;
  exp: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly blacklistService: JwtBlacklistService,
  ) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET não definido');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  private extractTokenFromRequest(req: Request): string | null {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) return null;

    return token;
  }

  async validate(req: Request, payload: JwtPayload, done: Function) {
    const token = this.extractTokenFromRequest(req);

    if (!token) {
      return done(new UnauthorizedException('Token não encontrado'), false);
    }

    const isBlacklisted = await this.blacklistService.has(token);
    if (isBlacklisted) {
      return done(new UnauthorizedException('Token blacklisted'), false);
    }

    return done(null, payload);
  }
}
