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
import { UpdateHeroDto } from 'src/dtos/updateHero.dto';

@Controller('hero')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Post()
  async create(@Body() dto: HeroDto): Promise<Hero> {
    return this.heroService.create(dto);
  }

  @Get('search/email')
  async findByEmail(@Query('email') email: string): Promise<Hero | null> {
    return this.heroService.findByEmail(email);
  }

@Get()
async findAll(
  @Query('status') status?: string,
  @Query('hero') hero?: string,
): Promise<Hero[]> {
  return this.heroService.findWithFilters(status, hero);
}


  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Hero> {
    return this.heroService.findById(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateHeroDto): Promise<Hero> {
    return this.heroService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.heroService.delete(id);
  }
}
