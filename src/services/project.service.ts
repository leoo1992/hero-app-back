import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { ProjectDto } from '../dtos/project.dto';
import { HeroService } from './hero.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    private readonly heroService: HeroService,
  ) {}

  async create(dto: ProjectDto): Promise<Project> {
    if (!dto.responsavel) {
      throw new NotFoundException('Responsável é obrigatório');
    }

    const responsavel = await this.heroService.findById(dto.responsavel);
    if (!responsavel) {
      throw new NotFoundException('Herói responsável não encontrado');
    }

    const project = this.projectRepository.create({
      nome: dto.nome,
      descricao: dto.descricao,
      status: dto.status,
      estatisticas: { ...dto.estatisticas },
      responsavel,
      criado: new Date(),
      atualizado: new Date(),
    });

    return this.projectRepository.save(project);
  }

  async findWithFilters(status?: string, responsavelId?: number): Promise<Project[]> {
    const query = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.responsavel', 'responsavel');

    if (status) {
      query.andWhere('project.status = :status', { status });
    }

    if (responsavelId) {
      query.andWhere('responsavel.id = :responsavelId', { responsavelId });
    }

    return query.getMany();
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({ relations: ['responsavel'] });
  }

  async findById(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['responsavel'],
    });
    if (!project) throw new NotFoundException('Project não encontrado');
    return project;
  }

  async update(id: number, dto: Partial<ProjectDto>): Promise<Project> {
    const project = await this.findById(id);

    if (dto.responsavel) {
      const responsavel = await this.heroService.findById(dto.responsavel);
      if (!responsavel) throw new NotFoundException('Herói responsável não encontrado');
      project.responsavel = responsavel;
    }

    if (dto.nome !== undefined) project.nome = dto.nome;
    if (dto.descricao !== undefined) project.descricao = dto.descricao;
    if (dto.status !== undefined) project.status = dto.status;
    if (dto.estatisticas !== undefined) project.estatisticas = { ...dto.estatisticas };

    project.atualizado = new Date();

    return this.projectRepository.save(project);
  }

  async delete(id: number): Promise<void> {
    const result = await this.projectRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Project não encontrado');
  }
}
