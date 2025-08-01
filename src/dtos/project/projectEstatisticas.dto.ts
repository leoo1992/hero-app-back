import { ApiProperty } from '@nestjs/swagger';

export class ProjectEstatisticasDto {
  @ApiProperty()
  agilidade: number;

  @ApiProperty()
  encantamento: number;

  @ApiProperty()
  eficiencia: number;

  @ApiProperty()
  excelencia: number;

  @ApiProperty()
  transparencia: number;

  @ApiProperty()
  ambicao: number;
}
