import { Module } from '@nestjs/common';
import { ProjectController } from '../controllers/project.controller';
import { ProjectService } from '../services/project.service';
import { HeroModule } from './hero.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';

@Module({
  imports: [HeroModule, TypeOrmModule.forFeature([Project])],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
