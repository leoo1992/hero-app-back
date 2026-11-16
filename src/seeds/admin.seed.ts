import { DataSource } from 'typeorm';
import 'reflect-metadata';
import { Hero } from '../entities/hero.entity';
import { Project } from '../entities/project.entity';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';
import { HeroType } from '../@types/hero/heroType';
import { AcessoType } from '../@types/hero/acessoType';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: [Hero, Project],
});

export const logger = new Logger('AdminSeed');

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Admin seed aborted: configure ADMIN_EMAIL and ADMIN_PASSWORD before running npm run seed.',
    );
  }

  if (password.length < 12) {
    throw new Error('Admin seed aborted: ADMIN_PASSWORD must contain at least 12 characters.');
  }

  try {
    await AppDataSource.initialize();
    const heroRepository = AppDataSource.getRepository(Hero);
    const adminExists = await heroRepository.findOneBy({ email });

    if (adminExists) {
      logger.log('Admin account already exists; no changes made.');
      return;
    }

    const admin = new Hero();
    admin.nome = 'Administrator';
    admin.email = email;
    admin.senha = await bcrypt.hash(password, 12);
    admin.acesso = AcessoType.ADMIN;
    admin.hero = HeroType.BATMAN;
    admin.criado = new Date();
    admin.atualizado = new Date();

    await heroRepository.save(admin);
    logger.log('Admin account created successfully.');
  } catch (error) {
    logger.error('Unable to execute admin seed.', error instanceof Error ? error.stack : String(error));
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}
