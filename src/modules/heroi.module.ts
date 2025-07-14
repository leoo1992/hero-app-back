import { Module } from '@nestjs/common';
import { HeroiController } from '../controllers/heroi.controller';
import { HeroiService } from '../services/heroi.service';

@Module({
  imports: [],
  controllers: [HeroiController],
  providers: [HeroiService],
  exports: [HeroiService],
})
export class HeroiModule {}
