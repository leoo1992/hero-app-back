import { Injectable, NotFoundException } from '@nestjs/common';
import { Projeto } from '../entities/projeto.entity';
import { CreateProjetoDto } from '../dtos/create-projeto.dto';
import { HeroiService } from './heroi.service';

@Injectable()
export class ProjetoService {
  private projetos: Projeto[] = [];
  private idCounter = 1;

  constructor(private readonly heroiService: HeroiService) {}

  async create(dto: CreateProjetoDto): Promise<Projeto> {
    if (!dto.responsavel) {
      throw new NotFoundException('Responsável é obrigatório');
    }

    const responsavel = await this.heroiService.findById(dto.responsavel);
    if (!responsavel) {
      throw new NotFoundException('Herói responsável não encontrado');
    }

    const projeto: Projeto = {
      id: this.idCounter++,
      nome: dto.nome,
      descricao: dto.descricao,
      status: dto.status,
      estatisticas: { ...dto.estatisticas },
      responsavel,
      criado: new Date(),
      atualizado: new Date(),
    };

    this.projetos.push(projeto);
    return projeto;
  }

  async findAll(): Promise<Projeto[]> {
    return this.projetos;
  }

  async findById(id: number): Promise<Projeto> {
    const projeto = this.projetos.find((p) => p.id === id);
    if (!projeto) throw new NotFoundException('Projeto não encontrado');
    return projeto;
  }

  async update(id: number, dto: Partial<CreateProjetoDto>): Promise<Projeto> {
    const index = this.projetos.findIndex((p) => p.id === id);
    if (index === -1) throw new NotFoundException('Projeto não encontrado');

    const atual = this.projetos[index];

    const responsavel = dto.responsavel
      ? await this.heroiService.findById(dto.responsavel)
      : atual.responsavel;

    const atualizado: Projeto = {
      ...atual,
      ...dto,
      estatisticas: dto.estatisticas ? { ...dto.estatisticas } : atual.estatisticas,
      responsavel,
      atualizado: new Date(),
    };

    this.projetos[index] = atualizado;
    return atualizado;
  }

  async delete(id: number): Promise<void> {
    const index = this.projetos.findIndex((p) => p.id === id);
    if (index === -1) throw new NotFoundException('Projeto não encontrado');

    this.projetos.splice(index, 1);
  }
}
