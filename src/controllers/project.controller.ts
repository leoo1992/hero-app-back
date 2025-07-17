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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProjectService } from '../services/project.service';
import { ProjectDto } from '../dtos/project.dto';
import { Project } from '../entities/project.entity';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Projetos')
@ApiBearerAuth()
@UseGuards(JwtBlacklistGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Cria um novo projeto' })
  @ApiResponse({ status: 201, description: 'Projeto criado com sucesso', type: Project })
  async create(@Body() dto: ProjectDto): Promise<Project> {
    return this.projectService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os projetos' })
  @ApiResponse({ status: 200, description: 'Lista de projetos', type: Project, isArray: true })
  async findAll(): Promise<Project[]> {
    return this.projectService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca projeto por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do projeto' })
  @ApiResponse({ status: 200, description: 'Projeto encontrado', type: Project })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Project> {
    return this.projectService.findById(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Atualiza um projeto por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do projeto' })
  @ApiResponse({ status: 200, description: 'Projeto atualizado', type: Project })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<ProjectDto>,
  ): Promise<Project> {
    return this.projectService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um projeto por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do projeto' })
  @ApiResponse({ status: 204, description: 'Projeto removido' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.projectService.delete(id);
  }
}
