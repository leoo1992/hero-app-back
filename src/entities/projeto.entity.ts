import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Heroi } from './heroi.entity';

export type TProjetoStatus = 'PENDENTE' | 'ANDAMENTO' | 'CONCLUIDO';

export interface TProjetoEstatisticas {
  agilidade: number;
  encantamento: number;
  eficiencia: number;
  excelencia: number;
  transparencia: number;
  ambicao: number;
}

@Entity('projetos')
export class Projeto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ type: 'text' })
  descricao: string;

  @Column({ type: 'varchar', length: 20 })
  status: TProjetoStatus;

  @Column({ type: 'json' })
  estatisticas: TProjetoEstatisticas;

  @ManyToOne(() => Heroi, { nullable: false })
  @JoinColumn({ name: 'responsavel' })
  responsavel: Heroi;

  @CreateDateColumn()
  criado: Date;

  @UpdateDateColumn()
  atualizado: Date;
}
