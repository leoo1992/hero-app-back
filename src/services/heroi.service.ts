import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateHeroiDto } from '../dtos/create-heroi.dto';
import { Heroi } from '../entities/heroi.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HeroiService {
  private herois: Heroi[] = [];
  private idCounter = 1;

  async create(dto: CreateHeroiDto): Promise<Heroi> {
    const hashedSenha = await bcrypt.hash(dto.senha, 10);
    const agora = new Date();

    const heroi: Heroi = {
      id: this.idCounter++,
      nome: dto.nome.toLowerCase(),
      email: dto.email.toLowerCase().trim(),
      senha: hashedSenha,
      hero: dto.hero ?? '',
      acesso: 'HERO',
      criado: agora,
      atualizado: agora,
      projetos: [],
    };

    this.herois.push(heroi);
    return heroi;
  }

  async findAll(): Promise<Heroi[]> {
    return this.herois;
  }

  async findById(id: number): Promise<Heroi> {
    const heroi = this.herois.find((h) => h.id === id);
    if (!heroi) throw new NotFoundException('Herói não encontrado');
    return heroi;
  }

  async findByEmail(email: string): Promise<Heroi | undefined> {
    const targetEmail = email.toLowerCase().trim();

    console.log('Buscando por email:', targetEmail);
    console.log('Lista de herois em memória:', this.herois);

    const found = this.herois.find((h) => {
      console.log(`Comparando ${h.email} com ${targetEmail}`);
      return h.email === targetEmail;
    });

    console.log('Retorno do find:', found);
    return found;
  }

  async update(id: number, dto: Partial<CreateHeroiDto>): Promise<Heroi> {
    const index = this.herois.findIndex((h) => h.id === id);
    if (index === -1) throw new NotFoundException('Herói não encontrado');

    const atual = this.herois[index];

    const senha = dto.senha ? await bcrypt.hash(dto.senha, 10) : atual.senha;

    const atualizado: Heroi = {
      ...atual,
      ...dto,
      senha,
      atualizado: new Date(),
    };

    this.herois[index] = atualizado;
    return atualizado;
  }

  async delete(id: number): Promise<void> {
    const index = this.herois.findIndex((h) => h.id === id);
    if (index === -1) throw new NotFoundException('Herói não encontrado');
    this.herois.splice(index, 1);
  }
}
