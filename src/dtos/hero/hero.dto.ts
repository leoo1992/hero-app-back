import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectDto } from '../project/project.dto';
import { HeroType } from 'src/@types/hero/heroType';

export class HeroDto {
  @ApiProperty({ example: 'Lucas Silva' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'lucas@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '12345678', minLength: 6 })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiProperty({ required: false, example: 'Super Herói' })
  @IsEnum(HeroType, { message: 'Hero deve ser um dos heróis válidos' })
  @IsString()
  hero?: HeroType;

  @ApiProperty({ type: [ProjectDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectDto)
  projects?: ProjectDto[];
}
