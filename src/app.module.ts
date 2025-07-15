import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth.module';
import { HeroModule } from './modules/hero.module';
import { ProjectModule } from './modules/project.module';

@Module({
  imports: [AuthModule, HeroModule, ProjectModule],
})
export class AppModule {}
