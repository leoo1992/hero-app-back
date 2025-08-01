import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { ProjectDto } from '../dtos/project/project.dto';
import { HeroService } from './hero.service';
import { ProjectStatus } from 'src/@types/project/projectStatus';

const validStatuses: ProjectStatus[] = [
  ProjectStatus.PENDENTE,
  ProjectStatus.ANDAMENTO,
  ProjectStatus.CONCLUIDO,
];

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly heroService: HeroService,
  ) {}

  async create(dto: ProjectDto): Promise<Project> {
    if (!dto.nome?.trim()) {
      throw new BadRequestException('Nome do projeto é obrigatório');
    }

    if (!dto.status?.trim()) {
      throw new BadRequestException('Status do projeto é obrigatório');
    }

    if (!dto.responsavel) {
      throw new BadRequestException('Responsável é obrigatório');
    }

    const responsavel = await this.heroService.findById(dto.responsavel);
    if (!responsavel) {
      throw new NotFoundException('Herói responsável não encontrado');
    }

    const project = this.projectRepository.create({
      nome: dto.nome,
      descricao: dto.descricao || '',
      status: dto.status,
      estatisticas: { ...dto.estatisticas },
      responsavel,
      criado: new Date(),
      atualizado: new Date(),
    });

    return this.projectRepository.save(project);
  }

  async findWithFilters(filters: {
    status?: string;
    responsavelId?: number;
    nome?: string;
    descricao?: string;
    criadoAntes?: string;
    criadoDepois?: string;
    atualizadoAntes?: string;
    atualizadoDepois?: string;
  }): Promise<Project[]> {
    const query = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.responsavel', 'responsavel');

    if (filters.status?.trim()) {
      query.andWhere('project.status = :status', { status: filters.status.trim() });
    }

    if (filters.responsavelId !== undefined) {
      if (isNaN(filters.responsavelId)) {
        throw new BadRequestException('responsavelId deve ser um número');
      }
      query.andWhere('responsavel.id = :responsavelId', {
        responsavelId: filters.responsavelId,
      });
    }

    if (filters.nome?.trim()) {
      query.andWhere('project.nome ILIKE :nome', {
        nome: `%${filters.nome.trim()}%`,
      });
    }

    if (filters.descricao?.trim()) {
      query.andWhere('project.descricao ILIKE :descricao', {
        descricao: `%${filters.descricao.trim()}%`,
      });
    }

    const parseDate = (value: string, field: string): Date => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new BadRequestException(`Data inválida para o campo ${field}`);
      }
      return date;
    };

    if (filters.criadoAntes) {
      query.andWhere('project.criado < :criadoAntes', {
        criadoAntes: parseDate(filters.criadoAntes, 'criadoAntes'),
      });
    }

    if (filters.criadoDepois) {
      query.andWhere('project.criado > :criadoDepois', {
        criadoDepois: parseDate(filters.criadoDepois, 'criadoDepois'),
      });
    }

    if (filters.atualizadoAntes) {
      query.andWhere('project.atualizado < :atualizadoAntes', {
        atualizadoAntes: parseDate(filters.atualizadoAntes, 'atualizadoAntes'),
      });
    }

    if (filters.atualizadoDepois) {
      query.andWhere('project.atualizado > :atualizadoDepois', {
        atualizadoDepois: parseDate(filters.atualizadoDepois, 'atualizadoDepois'),
      });
    }

    return query.getMany();
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({ relations: ['responsavel'] });
  }

  async findById(id: number): Promise<Project> {
    if (isNaN(id)) {
      throw new BadRequestException('ID inválido');
    }

    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['responsavel'],
    });

    if (!project) {
      throw new NotFoundException('Project não encontrado');
    }

    return project;
  }

  async update(id: number, dto: Partial<ProjectDto>): Promise<Project> {
    const project = await this.findById(id);

    if (dto.responsavel) {
      const responsavel = await this.heroService.findById(dto.responsavel);
      if (!responsavel) {
        throw new NotFoundException('Herói responsável não encontrado');
      }
      project.responsavel = responsavel;
    }

    if (dto.nome !== undefined) {
      if (!dto.nome.trim()) {
        throw new BadRequestException('Nome não pode ser vazio');
      }
      project.nome = dto.nome.trim();
    }

    if ('descricao' in dto) {
      project.descricao = typeof dto.descricao === 'string' ? dto.descricao.trim() : '';
    }

    if (dto.status !== undefined) {
      const trimmedStatus = dto.status.trim() as ProjectStatus;

      if (!trimmedStatus) {
        throw new BadRequestException('Status não pode ser vazio');
      }

      if (!validStatuses.includes(trimmedStatus)) {
        throw new BadRequestException('Status inválido');
      }

      project.status = trimmedStatus;
    }

    if (dto.estatisticas !== undefined) {
      project.estatisticas = { ...dto.estatisticas };
    }

    project.atualizado = new Date();

    return this.projectRepository.save(project);
  }

  async delete(id: number): Promise<void> {
    if (isNaN(id)) {
      throw new BadRequestException('ID inválido');
    }

    const result = await this.projectRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Project não encontrado');
    }
  }

  getProgresso(project: Project): number {
    const estatisticas = project.estatisticas;

    if (!estatisticas || typeof estatisticas !== 'object') {
      return 0;
    }

    const valores = Object.values(estatisticas);

    if (!valores.length) return 0;

    const soma = valores.reduce((acc, val) => acc + val, 0);
    const media = Math.round(soma / valores.length);

    return media;
  }
}
