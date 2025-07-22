import { Controller, Post, Body, Req, Res, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { Request, Response } from 'express';
import { JwtBlacklistService } from '../services/jwt-blacklist.service';
import { ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly jwtBlacklistService: JwtBlacklistService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Tokens gerados com sucesso',
    schema: {
      example: {
        access_token: 'jwt-access-token',
        refresh_token: 'jwt-refresh-token',
      },
    },
  })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(dto);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renova o access token usando o refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Novo access token gerado',
    schema: {
      example: {
        access_token: 'new-jwt-access-token',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token ausente ou inválido',
  })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) throw new UnauthorizedException('Refresh token ausente');

    const tokens = await this.authService.refreshTokens(refreshToken);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token: tokens.accessToken };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout do usuário, invalidando tokens' })
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso',
    schema: {
      example: { message: 'Logout realizado com sucesso' },
    },
  })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    const refreshToken = req.cookies['refresh_token'];

    if (refreshToken) {
      try {
        const payload = this.authService.decodeToken(refreshToken);
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const ttl = payload?.exp ? payload.exp - nowInSeconds : 0;

        if (ttl > 0) {
          await this.jwtBlacklistService.add(refreshToken);
        }
      } catch (error) {
        this.logger.error('Falha ao decodificar refresh token no logout', error);
      }
    }

    const authHeader = req.headers['authorization'];
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.replace('Bearer ', '').trim();
      try {
        const payload = this.authService.decodeToken(accessToken);
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const ttl = payload?.exp ? payload.exp - nowInSeconds : 0;

        if (ttl > 0) {
          await this.jwtBlacklistService.add(accessToken);
        }
      } catch (error) {
        this.logger.error('Falha ao decodificar access token no logout', error);
      }
    }

    return { message: 'Logout realizado com sucesso' };
  }
}
