import { forwardRef, Module } from '@nestjs/common';
import { HeroController } from '../controllers/hero.controller';
import { HeroService } from '../services/hero.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hero } from 'src/entities/hero.entity';
import { Project } from 'src/entities/project.entity';
import { JwtBlacklistGuard } from 'src/guards/jwt-blacklist.guard';
import { AuthModule } from './auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Hero, Project]), forwardRef(() => AuthModule)],
  controllers: [HeroController],
  providers: [HeroService, JwtBlacklistGuard],
  exports: [HeroService],
})
export class HeroModule {}
