/* import { Repository, DataSource } from 'typeorm';
import { Hero } from '../entities/hero.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HeroRepository extends Repository<Hero> {
  constructor(readonly dataSource: DataSource) {
    super(Hero, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<Hero | undefined> {
    const hero = await this.findOne({ where: { email } });
    return hero ?? undefined;
  }
}
 */
