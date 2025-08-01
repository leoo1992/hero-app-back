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
import { ProjectStatus } from 'src/@types/project/projectStatus';
import { ProjectEstatisticas } from 'src/@types/project/projectEstatisticas';
import { ProjectEstatisticasDto } from 'src/dtos/project/projectEstatisticas.dto';

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

  @ApiProperty({ enum: ProjectStatus, example: ProjectStatus.PENDENTE })
  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.PENDENTE })
  status: ProjectStatus;

  @ApiProperty({ type: ProjectEstatisticasDto })
  @Column({ type: 'json' })
  estatisticas: ProjectEstatisticas;

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
