import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HeroiService } from './heroi.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly heroiService: HeroiService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    
    const heroi = await this.heroiService.findByEmail(dto.email.toLowerCase().trim());

    console.log('encontrado :', heroi);

    if (!heroi) throw new UnauthorizedException('Email ou senha inválidos');

    console.log('Senha enviada:', dto.senha);
    console.log('Senha salva (hash):', heroi.senha);

    const senhaValida = await bcrypt.compare(dto.senha, heroi.senha);

    console.log('Senha válida?', senhaValida);

    if (!senhaValida) throw new UnauthorizedException('Email ou senha inválidos');

    const payload = { sub: heroi.id, email: heroi.email, nome: heroi.nome };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
}
