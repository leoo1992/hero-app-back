import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsObject,
  ValidateNested,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TProjectEstatisticas, TProjectStatus } from '../entities/project.entity';

export class ProjectDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsEnum(['PENDENTE', 'ANDAMENTO', 'CONCLUIDO'], {
    message: 'status deve ser PENDENTE, ANDAMENTO ou CONCLUIDO',
  })
  status: TProjectStatus;

  @IsObject()
  @ValidateNested()
  @Type(() => EstatisticasDto)
  estatisticas: TProjectEstatisticas;

  @IsInt()
  responsavel: number;
}

class EstatisticasDto implements TProjectEstatisticas {
  @IsInt()
  @Min(0)
  @Max(100)
  agilidade: number;

  @IsInt()
  @Min(0)
  @Max(100)
  encantamento: number;

  @IsInt()
  @Min(0)
  @Max(100)
  eficiencia: number;

  @IsInt()
  @Min(0)
  @Max(100)
  excelencia: number;

  @IsInt()
  @Min(0)
  @Max(100)
  transparencia: number;

  @IsInt()
  @Min(0)
  @Max(100)
  ambicao: number;
}
