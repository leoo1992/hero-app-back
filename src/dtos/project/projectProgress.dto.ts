import { ApiProperty } from '@nestjs/swagger';
import { Project } from 'src/entities/project.entity';

export class ProjectProgressDto extends Project {
  @ApiProperty({
    description: 'Percentual de progresso calculado com base nas estatísticas',
    example: 85,
  })
  progresso: number;
}
