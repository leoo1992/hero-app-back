import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectDto } from './project.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { HeroType } from './hero.dto';

export class UpdateHeroDto {
  @ApiPropertyOptional({ description: 'Nome do herói', example: 'Tony Stark' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ description: 'Email do herói', example: 'tony@stark.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Senha com no mínimo 6 caracteres', example: 'senha123' })
  @IsOptional()
  @MinLength(6)
  senha?: string;

  @ApiPropertyOptional({
    description: 'Nome do herói (alias)',
    example: 'Homem de Ferro',
    enum: HeroType,
  })
  @IsOptional()
  @IsEnum(HeroType, { message: 'Hero deve ser um dos heróis válidos' })
  hero?: HeroType;

  @ApiPropertyOptional({
    description: 'Lista de projetos do herói',
    type: [ProjectDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectDto)
  projects?: ProjectDto[];
}
