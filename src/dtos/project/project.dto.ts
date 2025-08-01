import { IsString, IsNotEmpty, IsEnum, IsObject, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from 'src/@types/project/projectStatus';
import { ProjectEstatisticas } from 'src/@types/project/projectEstatisticas';
import { EstatisticasDto } from './estatisticas.dto';

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
    enum: ProjectStatus,
    example: 'PENDENTE',
  })
  @IsEnum(ProjectStatus, {
    message: 'status deve ser PENDENTE, ANDAMENTO ou CONCLUIDO',
  })
  status: ProjectStatus;

  @ApiProperty({ type: EstatisticasDto })
  @IsObject()
  @ValidateNested()
  @Type(() => EstatisticasDto)
  estatisticas: ProjectEstatisticas;

  @ApiProperty({ example: 1 })
  @IsInt()
  responsavel: number;
}
