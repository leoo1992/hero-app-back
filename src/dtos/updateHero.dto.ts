import { IsEmail, IsOptional, IsString, MinLength, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectDto } from './project.dto';

export class UpdateHeroDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  senha?: string;

  @IsOptional()
  @IsString()
  hero?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectDto)
  projects?: ProjectDto[];
}
