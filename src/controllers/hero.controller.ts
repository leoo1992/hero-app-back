import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HeroService } from '../services/hero.service';
import { HeroDto } from '../dtos/hero.dto';
import { Hero } from '../entities/hero.entity';
import { UpdateHeroDto } from 'src/dtos/updateHero.dto';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@ApiTags('Heróis')
@ApiBearerAuth('access-token')
@Controller('hero')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo herói' })
  @ApiResponse({ status: 201, description: 'Herói criado com sucesso.', type: Hero })
  async create(@Body() dto: HeroDto): Promise<Hero> {
    return this.heroService.create(dto);
  }

  @Get()
  @Roles('ADMIN')
  @UseGuards(JwtBlacklistGuard, RolesGuard)
  @ApiOperation({ summary: 'Listar todos os heróis com filtros (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de heróis.', type: [Hero] })
  @ApiQuery({ name: 'status', required: false, description: 'Status do projeto' })
  @ApiQuery({ name: 'hero', required: false, description: 'Nome do personagem' })
  @ApiQuery({ name: 'email', required: false, description: 'Email do herói' })
  @ApiQuery({ name: 'nome', required: false, description: 'Nome real do herói' })
  @ApiQuery({ name: 'id', required: false, description: 'ID do herói' })
  async findAll(
    @Query('status') status?: string,
    @Query('hero') hero?: string,
    @Query('email') email?: string,
    @Query('nome') nome?: string,
    @Query('id') id?: number,
  ): Promise<Hero[]> {
    return this.heroService.findWithFilters({ status, hero, email, nome, id });
  }

  @Get(':id')
  @UseGuards(JwtBlacklistGuard)
  @ApiOperation({ summary: 'Buscar herói por ID' })
  @ApiResponse({ status: 200, description: 'Herói encontrado.', type: Hero })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Hero> {
    return this.heroService.findById(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  @UseGuards(JwtBlacklistGuard, RolesGuard)
  @ApiOperation({ summary: 'Atualizar herói por ID (ADMIN)' })
  @ApiResponse({ status: 200, description: 'Herói atualizado.', type: Hero })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateHeroDto): Promise<Hero> {
    return this.heroService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(JwtBlacklistGuard, RolesGuard)
  @ApiOperation({ summary: 'Excluir herói por ID (ADMIN)' })
  @ApiResponse({ status: 204, description: 'Herói excluído com sucesso.' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.heroService.delete(id);
  }
}
