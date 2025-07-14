import { Module } from '@nestjs/common';
import { ProjetoController } from '../controllers/projeto.controller';
import { ProjetoService } from '../services/projeto.service';
import { HeroiModule } from './heroi.module';

@Module({
  imports: [HeroiModule],
  controllers: [ProjetoController],
  providers: [ProjetoService],
  exports: [ProjetoService],
})
export class ProjetoModule {}
