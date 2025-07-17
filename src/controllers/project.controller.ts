import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from '../services/project.service';
import { ProjectDto } from '../dtos/project.dto';
import { Project } from '../entities/project.entity';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';

@UseGuards(JwtBlacklistGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Body() dto: ProjectDto): Promise<Project> {
    return this.projectService.create(dto);
  }

  @Get()
  async findAll(): Promise<Project[]> {
    return this.projectService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Project> {
    return this.projectService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<ProjectDto>,
  ): Promise<Project> {
    return this.projectService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.projectService.delete(id);
  }
}
