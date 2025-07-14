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
import { HeroiService } from '../services/heroi.service';
import { CreateHeroiDto } from '../dtos/create-heroi.dto';
import { Heroi } from '../entities/heroi.entity';

@Controller('hero')
export class HeroiController {
  constructor(private readonly heroiService: HeroiService) {}

  @Post()
  async create(@Body() dto: CreateHeroiDto): Promise<Heroi> {
    return this.heroiService.create(dto);
  }

  @Get()
  async findAll(): Promise<Heroi[]> {
    return this.heroiService.findAll();
  }

  @Get('search')
  async findByEmail(@Query('email') email: string): Promise<Heroi | undefined> {
    return this.heroiService.findByEmail(email);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Heroi> {
    return this.heroiService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateHeroiDto>,
  ): Promise<Heroi> {
    return this.heroiService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.heroiService.delete(id);
  }
}
