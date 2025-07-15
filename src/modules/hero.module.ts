import { Module } from '@nestjs/common';
import { HeroController } from '../controllers/hero.controller';
import { HeroService } from '../services/hero.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hero } from 'src/entities/hero.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hero])],
  controllers: [HeroController],
  providers: [HeroService],
  exports: [HeroService],
})
export class HeroModule {}
