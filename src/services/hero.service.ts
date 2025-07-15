import { Injectable, NotFoundException } from '@nestjs/common';
import { HeroDto } from '../dtos/hero.dto';
import { Hero } from '../entities/hero.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HeroService {
  private heros: Hero[] = [];
  private idCounter = 1;

  async create(dto: HeroDto): Promise<Hero> {
    const hashedSenha = await bcrypt.hash(dto.senha, 10);
    const agora = new Date();

    const hero: Hero = {
      id: this.idCounter++,
      nome: dto.nome.toLowerCase(),
      email: dto.email.toLowerCase().trim(),
      senha: hashedSenha,
      hero: dto.hero ?? '',
      acesso: 'HERO',
      criado: agora,
      atualizado: agora,
      projects: [],
    };

    this.heros.push(hero);
    return hero;
  }

  async findAll(): Promise<Hero[]> {
    return this.heros;
  }

  async findById(id: number): Promise<Hero> {
    const hero = this.heros.find((h) => h.id === id);
    if (!hero) throw new NotFoundException('Herói não encontrado');
    return hero;
  }

  async findByEmail(email: string): Promise<Hero | undefined> {
    const targetEmail = email.toLowerCase().trim();
    const found = this.heros.find((h) => {
      return h.email === targetEmail;
    });

    return found;
  }

  async update(id: number, dto: Partial<HeroDto>): Promise<Hero> {
    const index = this.heros.findIndex((h) => h.id === id);
    if (index === -1) throw new NotFoundException('Herói não encontrado');

    const atual = this.heros[index];
    const senha = dto.senha ? await bcrypt.hash(dto.senha, 10) : atual.senha;
    const atualizado: Hero = {
      ...atual,
      ...dto,
      senha,
      atualizado: new Date(),
    };

    this.heros[index] = atualizado;
    return atualizado;
  }

  async delete(id: number): Promise<void> {
    const index = this.heros.findIndex((h) => h.id === id);
    if (index === -1) throw new NotFoundException('Herói não encontrado');
    this.heros.splice(index, 1);
  }
}
