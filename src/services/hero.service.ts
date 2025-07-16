import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hero } from '../entities/hero.entity';
import { HeroDto } from '../dtos/hero.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HeroService {
  constructor(
    @InjectRepository(Hero)
    private readonly heroRepository: Repository<Hero>,
  ) {}

  async create(dto: HeroDto): Promise<Hero> {
    const senhaCriptografada = await bcrypt.hash(dto.senha, 10);
    const hero = this.heroRepository.create({
      ...dto,
      senha: senhaCriptografada,
      acesso: 'HERO',
      criado: new Date(),
      atualizado: new Date(),
    });
    return this.heroRepository.save(hero);
  }

  async findAll(): Promise<Hero[]> {
    return this.heroRepository.find({ relations: ['projects'] });
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

  async update(id: number, dto: Partial<HeroDto>): Promise<Hero> {
    const hero = await this.findById(id);
    const atualizado = {
      ...hero,
      ...dto,
      senha: dto.senha ? await bcrypt.hash(dto.senha, 10) : hero.senha,
      atualizado: new Date(),
    };
    return this.heroRepository.save(atualizado);
  }

  async delete(id: number): Promise<void> {
    await this.heroRepository.delete(id);
  }
}
