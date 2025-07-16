import { DataSource } from 'typeorm';
import 'dotenv/config';
import { Hero } from '../entities/hero.entity';
import { Project } from '../entities/project.entity';
import * as bcrypt from 'bcrypt';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT! || '5433'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: [Hero, Project],
});

export async function seedAdmin() {
  await AppDataSource.initialize();
  const heroRepository = AppDataSource.getRepository(Hero);
  const exists = await heroRepository.findOneBy({ email: 'admin@heroforce.com' });

  if (!exists) {
    const admin = new Hero();
    admin.nome = 'Admin';
    admin.email = 'admin@heroforce.com';
    admin.senha = await bcrypt.hash('admin123', 10);
    admin.acesso = 'ADMIN';
    admin.criado = new Date();
    admin.atualizado = new Date();

    await heroRepository.save(admin);
    console.log('Usuário ADMIN criado.');
  } else {
    console.log('Usuário ADMIN já existe.');
  }

  await AppDataSource.destroy();
}
