import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtBlacklistService } from '../services/jwt-blacklist.service';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtBlacklistGuard implements CanActivate {
  constructor(private readonly jwtBlacklistService: JwtBlacklistService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Token ausente');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      throw new UnauthorizedException('Token inválido');
    }

    const isBlacklisted = await this.jwtBlacklistService.isBlacklisted(token);

    if (isBlacklisted) {
      throw new UnauthorizedException('Token inválido (logout)');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'secret');
      request.user = decoded;
      return true;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token expirado');
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Token malformado');
      }

      throw new UnauthorizedException('Token inválido');
    }
  }
}
