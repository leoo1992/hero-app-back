import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UnauthorizedException,
  Logger,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { Request, Response } from 'express';
import { JwtBlacklistService } from '../services/jwt-blacklist.service';
import { ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AcessoType } from 'src/@types/hero/acessoType';

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
    const { accessToken, refreshToken, nome, acesso, email, usuario } =
      await this.authService.login(dto);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      nome,
      acesso,
      email,
      usuario,
    };
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
    await this.handleRefreshToken(req);
    await this.handleAccessToken(req);

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { message: 'Logout realizado com sucesso' };
  }

  private async handleRefreshToken(req: Request): Promise<void> {
    const refreshToken = req.cookies['refresh_token'];
    const cookies = req.cookies;
    if (!cookies) {
      this.logger.warn('Cookies não encontrados na requisição.');
      return;
    }

    if (!refreshToken) {
      this.logger.warn('Refresh token não encontrado nos cookies.');
      return;
    }

    try {
      const payload = this.authService.decodeToken(refreshToken);
      const ttl = this.getTokenTTL(payload);

      if (ttl > 0) {
        await this.jwtBlacklistService.add(refreshToken);
      }
    } catch (error) {
      this.logger.warn('Erro ao decodificar refresh token no logout:', error);
    }
  }

  private async handleAccessToken(req: Request): Promise<void> {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      this.logger.warn('Nenhum token de acesso encontrado no cabeçalho Authorization');
      return;
    }

    const accessToken = authHeader.replace('Bearer ', '').trim();
    if (!accessToken) {
      throw new BadRequestException();
    }

    try {
      const payload = this.authService.decodeToken(accessToken);
      const ttl = this.getTokenTTL(payload);

      if (ttl > 0) {
        await this.jwtBlacklistService.add(accessToken);
      } else {
        this.logger.warn('Access token já expirado no logout');
      }
    } catch (error) {
      this.logger.warn('Falha ao decodificar access token no logout', error);
    }
  }

  private getTokenTTL(payload: any): number {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload?.exp ? payload.exp - nowInSeconds : 0;
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verifica se o token é válido e retorna dados do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    schema: {
      example: {
        nome: 'Lucas Silva',
        email: 'lucas@email.com',
        acesso: AcessoType.ADMIN,
      },
    },
  })
  async verify(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token ausente');
    }
    const token = authHeader.replace('Bearer ', '').trim();
    return this.authService.verifyToken(token);
  }

  @Get('me')
  @ApiOperation({ summary: 'Retorna dados do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário retornados com sucesso',
    schema: {
      example: {
        nome: 'Admin',
        email: 'admin@heroforce.com',
        acesso: AcessoType.ADMIN,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou ausente' })
  async me(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    let token: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '').trim();
    } else if (req.cookies?.refresh_token) {
      token = req.cookies['refresh_token'];
    }

    if (!token) {
      throw new UnauthorizedException('Token ausente');
    }

    const userData = await this.authService.verifyToken(token);
    return { ...userData, token };
  }
}
