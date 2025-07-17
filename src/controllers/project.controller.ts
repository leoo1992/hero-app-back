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
import { ProjectDto } from '../dtos/project.dto';
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

@ApiTags('Projetos')
@ApiBearerAuth()
@UseGuards(JwtBlacklistGuard, RolesGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Cria um novo projeto (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Projeto criado com sucesso', type: Project })
  async create(@Body() dto: ProjectDto): Promise<Project> {
    return this.projectService.create(dto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'responsavelId', required: false, description: 'ID do herói responsável' })
  async findAll(
    @Query('status') status?: string,
    @Query('responsavelId') responsavelId?: number,
  ): Promise<Project[]> {
    return this.projectService.findWithFilters(status, responsavelId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca projeto por ID (autenticado)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do projeto' })
  @ApiResponse({ status: 200, description: 'Projeto encontrado', type: Project })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Project> {
    return this.projectService.findById(id);
  }

  @Put(':id')
  @Roles('ADMIN')
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
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remove um projeto por ID (ADMIN)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do projeto' })
  @ApiResponse({ status: 204, description: 'Projeto removido' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.projectService.delete(id);
  }
}
