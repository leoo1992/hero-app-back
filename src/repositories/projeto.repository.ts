/* import { Repository, DataSource } from 'typeorm';
import { Heroi } from '../entities/heroi.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HeroiRepository extends Repository<Heroi> {
  constructor(readonly dataSource: DataSource) {
    super(Heroi, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<Heroi | undefined> {
    const heroi = await this.findOne({ where: { email } });
    return heroi ?? undefined;
  }
}
 */
