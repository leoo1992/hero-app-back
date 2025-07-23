import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hero } from '../entities/hero.entity';
import { HeroDto } from '../dtos/hero.dto';
import * as bcrypt from 'bcrypt';
import { Project } from 'src/entities/project.entity';
import { UpdateHeroDto } from 'src/dtos/updateHero.dto';

@Injectable()
export class HeroService {
  constructor(
    @InjectRepository(Hero)
    private readonly heroRepository: Repository<Hero>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(dto: HeroDto): Promise<Hero> {
    if (!dto.nome || !dto.email || !dto.senha || !dto.hero) {
      throw new BadRequestException('Campos obrigatórios não preenchidos');
    }

    const existing = await this.heroRepository.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new ConflictException('Já existe um herói com este e-mail');
    }

    const senhaCriptografada = await bcrypt.hash(dto.senha, 10);

    const hero = this.heroRepository.create({
      nome: dto.nome,
      email: dto.email.toLowerCase().trim(),
      senha: senhaCriptografada,
      hero: dto.hero,
      acesso: 'HERO',
      criado: new Date(),
      atualizado: new Date(),
    });

    const savedHero = await this.heroRepository.save(hero);

    if (dto.projects && dto.projects.length > 0) {
      const projetosCriados = dto.projects.map((p) =>
        this.projectRepository.create({ ...p, responsavel: savedHero }),
      );

      const projetosSalvos = await this.projectRepository.save(projetosCriados);

      savedHero.projects = projetosSalvos;
      await this.heroRepository.save(savedHero);
    }

    return savedHero;
  }

  async findAll(): Promise<Hero[]> {
    return this.heroRepository.find({ relations: ['projects'] });
  }

  async findWithFilters(filters: {
    status?: string;
    hero?: string;
    email?: string;
    nome?: string;
    id?: number;
  }): Promise<Hero[]> {
    const query = this.heroRepository
      .createQueryBuilder('hero')
      .leftJoinAndSelect('hero.projects', 'project');

    if (filters.status) {
      query.andWhere('project.status = :status', { status: filters.status });
    }

    if (filters.hero) {
      query.andWhere('hero.hero ILIKE :hero', { hero: `%${filters.hero}%` });
    }

    if (filters.email) {
      query.andWhere('hero.email ILIKE :email', {
        email: `%${filters.email.trim().toLowerCase()}%`,
      });
    }

    if (filters.nome) {
      query.andWhere('hero.nome ILIKE :nome', { nome: `%${filters.nome}%` });
    }

    if (filters.id) {
      query.andWhere('hero.id = :id', { id: filters.id });
    }

    return query.getMany();
  }

  async findByEmail(email: string): Promise<Hero> {
    const hero = await this.heroRepository.findOne({
      where: { email: email.toLowerCase().trim() },
      relations: ['projects'],
    });

    if (!hero) {
      throw new NotFoundException('Herói com este email não foi encontrado');
    }

    return hero;
  }

  async findById(id: number): Promise<Hero> {
    const hero = await this.heroRepository.findOne({
      where: { id },
      relations: ['projects'],
    });

    if (!hero) {
      throw new NotFoundException(`Herói com ID ${id} não encontrado`);
    }

    return hero;
  }

  async update(id: number, dto: Partial<UpdateHeroDto>): Promise<Hero> {
    const hero = await this.findById(id);

    if (dto.email) {
      const emailExistente = await this.heroRepository.findOne({
        where: {
          email: dto.email.toLowerCase().trim(),
        },
      });

      if (emailExistente && emailExistente.id !== id) {
        throw new ConflictException('Este e-mail já está em uso por outro herói');
      }

      hero.email = dto.email.toLowerCase().trim();
    }

    if (dto.nome) hero.nome = dto.nome;
    if (dto.senha) hero.senha = await bcrypt.hash(dto.senha, 10);
    if (dto.hero !== undefined) hero.hero = dto.hero;
    hero.atualizado = new Date();

    if (dto.projects && dto.projects.length > 0) {
      const projetosCriados = dto.projects.map((p) =>
        this.projectRepository.create({ ...p, responsavel: hero }),
      );
      await this.projectRepository.save(projetosCriados);

      hero.projects = [...(hero.projects), ...projetosCriados];
    }

    return this.heroRepository.save(hero);
  }

  async delete(id: number): Promise<void> {
    const exists = await this.heroRepository.findOne({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Herói com ID ${id} não encontrado`);
    }
    await this.heroRepository.delete(id);
  }
}
