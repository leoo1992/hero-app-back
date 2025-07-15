import { Injectable, NotFoundException } from '@nestjs/common';
import { Project } from '../entities/project.entity';
import { CreateProjectDto } from '../dtos/project.dto';
import { HeroService } from './hero.service';

@Injectable()
export class ProjectService {
  private projects: Project[] = [];
  private idCounter = 1;

  constructor(private readonly heroService: HeroService) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    if (!dto.responsavel) {
      throw new NotFoundException('Responsável é obrigatório');
    }

    const responsavel = await this.heroService.findById(dto.responsavel);
    if (!responsavel) {
      throw new NotFoundException('Herói responsável não encontrado');
    }

    const project: Project = {
      id: this.idCounter++,
      nome: dto.nome,
      descricao: dto.descricao,
      status: dto.status,
      estatisticas: { ...dto.estatisticas },
      responsavel,
      criado: new Date(),
      atualizado: new Date(),
    };

    this.projects.push(project);
    return project;
  }

  async findAll(): Promise<Project[]> {
    return this.projects;
  }

  async findById(id: number): Promise<Project> {
    const project = this.projects.find((p) => p.id === id);
    if (!project) throw new NotFoundException('Project não encontrado');
    return project;
  }

  async update(id: number, dto: Partial<CreateProjectDto>): Promise<Project> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) throw new NotFoundException('Project não encontrado');

    const atual = this.projects[index];

    const responsavel = dto.responsavel
      ? await this.heroService.findById(dto.responsavel)
      : atual.responsavel;

    const atualizado: Project = {
      ...atual,
      ...dto,
      estatisticas: dto.estatisticas ? { ...dto.estatisticas } : atual.estatisticas,
      responsavel,
      atualizado: new Date(),
    };

    this.projects[index] = atualizado;
    return atualizado;
  }

  async delete(id: number): Promise<void> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) throw new NotFoundException('Project não encontrado');

    this.projects.splice(index, 1);
  }
}
