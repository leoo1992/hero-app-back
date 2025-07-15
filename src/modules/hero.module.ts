import { Module } from '@nestjs/common';
import { HeroController } from '../controllers/hero.controller';
import { HeroService } from '../services/hero.service';

@Module({
  imports: [],
  controllers: [HeroController],
  providers: [HeroService],
  exports: [HeroService],
})
export class HeroModule {}
