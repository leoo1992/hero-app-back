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
} from '@nestjs/common';
import { HeroService } from '../services/hero.service';
import { HeroDto } from '../dtos/hero.dto';
import { Hero } from '../entities/hero.entity';

@Controller('hero')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Post()
  async create(@Body() dto: HeroDto): Promise<Hero> {
    return this.heroService.create(dto);
  }

  @Get()
  async findAll(): Promise<Hero[]> {
    return this.heroService.findAll();
  }

  @Get('search')
  async findByEmail(@Query('email') email: string): Promise<Hero | null> {
    return this.heroService.findByEmail(email);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Hero> {
    return this.heroService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<HeroDto>,
  ): Promise<Hero> {
    return this.heroService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.heroService.delete(id);
  }
}
