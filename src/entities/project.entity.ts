import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Type } from 'class-transformer';
import { Hero } from './hero.entity';

export type TProjectStatus = 'PENDENTE' | 'ANDAMENTO' | 'CONCLUIDO';

export interface TProjectEstatisticas {
  agilidade: number;
  encantamento: number;
  eficiencia: number;
  excelencia: number;
  transparencia: number;
  ambicao: number;
}

@Entity('projects')
export class Project {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ length: 100 })
  nome: string;

  @ApiProperty()
  @Column({ type: 'text' })
  descricao: string;

  @ApiProperty({ enum: ['PENDENTE', 'ANDAMENTO', 'CONCLUIDO'] })
  @Column({ type: 'varchar', length: 20 })
  status: TProjectStatus;

  @ApiProperty({
    type: 'object',
    example: {
      agilidade: 80,
      encantamento: 90,
      eficiencia: 85,
      excelencia: 75,
      transparencia: 70,
      ambicao: 95,
    },
    properties: {
      agilidade: { type: 'number' },
      encantamento: { type: 'number' },
      eficiencia: { type: 'number' },
      excelencia: { type: 'number' },
      transparencia: { type: 'number' },
      ambicao: { type: 'number' },
    },
  })
  @Column({ type: 'json' })
  estatisticas: TProjectEstatisticas;

  @ApiProperty({
    type:
      /* istanbul ignore next */
      () => Hero,
  })
  @ManyToOne(() => Hero, { nullable: false })
  @JoinColumn({ name: 'responsavel' })
  @Type(() => Hero)
  responsavel: Hero;

  @ApiProperty()
  @CreateDateColumn()
  criado: Date;

  @ApiProperty()
  @UpdateDateColumn()
  atualizado: Date;
}
