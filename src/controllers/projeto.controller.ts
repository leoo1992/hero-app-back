import { Body, Controller, Get, Param, Post, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { ProjetoService } from '../services/projeto.service';
import { CreateProjetoDto } from '../dtos/create-projeto.dto';
import { Projeto } from '../entities/projeto.entity';

@Controller('projetos')
export class ProjetoController {
  constructor(private readonly projetoService: ProjetoService) {}

  @Post()
  async create(@Body() dto: CreateProjetoDto): Promise<Projeto> {
    return this.projetoService.create(dto);
  }

  @Get()
  async findAll(): Promise<Projeto[]> {
    return this.projetoService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Projeto> {
    return this.projetoService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateProjetoDto>,
  ): Promise<Projeto> {
    return this.projetoService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.projetoService.delete(id);
  }
}
