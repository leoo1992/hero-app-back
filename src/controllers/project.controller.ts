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
  Query,
} from '@nestjs/common';
import { ProjectService } from '../services/project.service';
import { ProjectDto } from '../dtos/project/project.dto';
import { Project } from '../entities/project.entity';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProjectProgressDto } from 'src/dtos/project/projectProgress.dto';
import { AcessoType } from 'src/@types/hero/acessoType';

@ApiTags('Projetos')
@ApiBearerAuth()
@UseGuards(JwtBlacklistGuard, RolesGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @Roles(AcessoType.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Cria um novo projeto (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Projeto criado com sucesso', type: Project })
  async create(@Body() dto: ProjectDto): Promise<Project> {
    return this.projectService.create(dto);
  }

  @Get()
  @Roles(AcessoType.ADMIN)
  @ApiOperation({ summary: 'Buscar projetos com filtros (ADMIN)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'responsavelId', required: false, description: 'ID do herói responsável' })
  @ApiQuery({ name: 'nome', required: false, description: 'Nome parcial do projeto' })
  @ApiQuery({ name: 'descricao', required: false, description: 'Descrição parcial do projeto' })
  @ApiResponse({
    status: 200,
    description: 'Lista de projetos com progresso',
    type: ProjectProgressDto,
    isArray: true,
  })
  async findAll(
    @Query('status') status?: string,
    @Query('responsavelId') responsavelId?: number,
    @Query('nome') nome?: string,
    @Query('descricao') descricao?: string,
  ): Promise<ProjectProgressDto[]> {
    const projects = await this.projectService.findWithFilters({
      status,
      responsavelId,
      nome,
      descricao,
    });

    return projects.map((project) => ({
      ...project,
      progresso: this.projectService.getProgresso(project),
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca projeto por ID (autenticado)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do projeto' })
  @ApiResponse({
    status: 200,
    description: 'Projeto encontrado com progresso',
    type: ProjectProgressDto,
  })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<ProjectProgressDto> {
    const project = await this.projectService.findById(id);
    return {
      ...project,
      progresso: this.projectService.getProgresso(project),
    };
  }

  @Put(':id')
  @Roles(AcessoType.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Atualiza um projeto por ID (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do projeto' })
  @ApiResponse({ status: 200, description: 'Projeto atualizado', type: Project })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<ProjectDto>,
  ): Promise<Project> {
    return this.projectService.update(id, dto);
  }

  @Delete(':id')
  @Roles(AcessoType.ADMIN)
  @ApiOperation({ summary: 'Remove um projeto por ID (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do projeto' })
  @ApiResponse({ status: 204, description: 'Projeto removido' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.projectService.delete(id);
  }
}
