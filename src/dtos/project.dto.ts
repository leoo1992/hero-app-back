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
import { ApiProperty } from '@nestjs/swagger';

export class EstatisticasDto implements TProjectEstatisticas {
  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  agilidade: number;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  encantamento: number;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  eficiencia: number;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  excelencia: number;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  transparencia: number;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  ambicao: number;
}

export class ProjectDto {
  @ApiProperty({ example: 'Sistema de CRM' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'Projeto para gerenciamento de relacionamento com o cliente' })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({
    enum: ['PENDENTE', 'ANDAMENTO', 'CONCLUIDO'],
    example: 'PENDENTE',
  })
  @IsEnum(['PENDENTE', 'ANDAMENTO', 'CONCLUIDO'], {
    message: 'status deve ser PENDENTE, ANDAMENTO ou CONCLUIDO',
  })
  status: TProjectStatus;

  @ApiProperty({ type: EstatisticasDto })
  @IsObject()
  @ValidateNested()
  @Type(() => EstatisticasDto)
  estatisticas: TProjectEstatisticas;

  @ApiProperty({ example: 1 })
  @IsInt()
  responsavel: number;
}
