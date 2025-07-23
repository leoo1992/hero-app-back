import { DataSource } from 'typeorm';
import 'dotenv/config';
import { Hero } from '../entities/hero.entity';
import { Project } from '../entities/project.entity';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

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

    const exists = await heroRepository.findOneBy({ email: 'admin@heroforce.com' });

    if (!exists) {
      const admin = new Hero();
      admin.nome = 'Admin';
      admin.email = 'admin@heroforce.com';
      admin.senha = await bcrypt.hash('admin123', 10);
      admin.acesso = 'ADMIN';
      admin.hero = 'Batman';
      admin.criado = new Date();
      admin.atualizado = new Date();

      await heroRepository.save(admin);
      logger.warn('Usuário ADMIN criado.');
    } else {
      logger.warn('Usuário ADMIN já existe.');
    }
  } catch (error) {
    logger.error('Erro ao executar seedAdmin:', error);
  } finally {
    await AppDataSource.destroy();
  }
}
