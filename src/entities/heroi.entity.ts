import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Projeto } from './projeto.entity';

@Entity('herois')
export class Heroi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  senha: string;

  @Column({ nullable: true })
  hero?: string;

  @Column({ default: 'HERO' })
  acesso: 'HERO' | 'ADMIN';

  @Column({ type: 'timestamp', nullable: true })
  criado: Date;

  @Column({ type: 'timestamp', nullable: true })
  atualizado: Date;

  @OneToMany(() => Projeto, (projeto) => projeto.responsavel)
  projetos: Projeto[];
}
