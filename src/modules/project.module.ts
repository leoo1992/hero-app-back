import { forwardRef, Module } from '@nestjs/common';
import { ProjectController } from '../controllers/project.controller';
import { ProjectService } from '../services/project.service';
import { HeroModule } from './hero.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';
import { JwtBlacklistGuard } from 'src/guards/jwt-blacklist.guard';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    forwardRef(() => HeroModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [ProjectController],
  providers: [ProjectService, JwtBlacklistGuard],
  exports: [ProjectService],
})
export class ProjectModule {}
