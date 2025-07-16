import { Injectable } from '@nestjs/common';
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

  async findWithFilters(status?: string, hero?: string): Promise<Hero[]> {
    const query = this.heroRepository
      .createQueryBuilder('hero')
      .leftJoinAndSelect('hero.projects', 'project');

    if (status) {
      query.andWhere('project.status = :status', { status });
    }

    if (hero) {
      query.andWhere('hero.hero ILIKE :hero', { hero: `%${hero}%` });
    }

    return query.getMany();
  }

  async findByEmail(email: string): Promise<Hero | null> {
    return this.heroRepository.findOne({
      where: { email: email.toLowerCase().trim() },
      relations: ['projects'],
    });
  }

  async findById(id: number): Promise<Hero> {
    return this.heroRepository.findOneOrFail({
      where: { id },
      relations: ['projects'],
    });
  }

  async update(id: number, dto: Partial<UpdateHeroDto>): Promise<Hero> {
    const hero = await this.findById(id);

    if (dto.nome) hero.nome = dto.nome;
    if (dto.email) hero.email = dto.email.toLowerCase().trim();
    if (dto.senha) hero.senha = await bcrypt.hash(dto.senha, 10);
    if (dto.hero !== undefined) hero.hero = dto.hero;
    hero.atualizado = new Date();
    if (dto.projects && dto.projects.length > 0) {
      const projetosCriados = dto.projects.map((p) =>
        this.projectRepository.create({ ...p, responsavel: hero }),
      );
      await this.projectRepository.save(projetosCriados);
      hero.projects = [...(hero.projects || []), ...projetosCriados];
    }

    return this.heroRepository.save(hero);
  }

  async delete(id: number): Promise<void> {
    await this.heroRepository.delete(id);
  }
}
