import { DataSource } from 'typeorm';
import 'dotenv/config';
import { Hero } from '../entities/hero.entity';
import { Project } from '../entities/project.entity';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';
import { HeroType } from 'src/dtos/hero.dto';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: [Hero, Project],
});

export const logger = new Logger('SeedAdmin');

export async function seedAdmin() {
  try {
    await AppDataSource.initialize();
    const heroRepository = AppDataSource.getRepository(Hero);

    const adminExists = await heroRepository.findOneBy({ email: 'admin@heroforce.com' });
    if (!adminExists) {
      const admin = new Hero();
      admin.nome = 'Admin';
      admin.email = 'admin@heroforce.com';
      admin.senha = await bcrypt.hash('admin123', 10);
      admin.acesso = 'ADMIN';
      admin.hero = HeroType.BATMAN;
      admin.criado = new Date();
      admin.atualizado = new Date();

      await heroRepository.save(admin);
      logger.log('Usuário ADMIN criado.');
    } else {
      logger.log('Usuário ADMIN já existe.');
    }

    const heroExists = await heroRepository.findOneBy({ email: 'santos-contato@hotmail.com.br' });
    if (!heroExists) {
      const hero = new Hero();
      hero.nome = 'Leonardo Santos';
      hero.email = 'santos-contato@hotmail.com.br';
      hero.senha = await bcrypt.hash('123456', 10);
      hero.acesso = 'HERO';
      hero.hero = HeroType.SUPERMAN;
      hero.criado = new Date();
      hero.atualizado = new Date();

      await heroRepository.save(hero);
      logger.log('Usuário HERO criado.');
    } else {
      logger.log('Usuário HERO já existe.');
    }

  } catch (error) {
    logger.error('Erro ao executar seedAdmin:', error);
  } finally {
    await AppDataSource.destroy();
  }
}
