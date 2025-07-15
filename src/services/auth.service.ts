import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HeroService } from './hero.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly heroService: HeroService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const hero = await this.heroService.findByEmail(dto.email.toLowerCase().trim());

    if (!hero) throw new UnauthorizedException('Email ou senha inválidos');

    const senhaValida = await bcrypt.compare(dto.senha, hero.senha);

    if (!senhaValida) throw new UnauthorizedException('Email ou senha inválidos');

    const payload = { sub: hero.id, email: hero.email, nome: hero.nome };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
}
