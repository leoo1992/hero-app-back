import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth.module';  // caminho correto?
import { HeroiModule } from './modules/heroi.module';
import { ProjetoModule } from './modules/projeto.module';

@Module({
  imports: [
    AuthModule,
    HeroiModule,
    ProjetoModule
  ],
})
export class AppModule {}
