import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
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
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'varchar', length: 20 })
  status: TProjectStatus;

  @Column({ type: 'json' })
  estatisticas: TProjectEstatisticas;

  @ManyToOne(() => Hero, { nullable: false })
  @JoinColumn({ name: 'responsavel' })
  responsavel: Hero;

  @CreateDateColumn()
  criado: Date;

  @UpdateDateColumn()
  atualizado: Date;
}
