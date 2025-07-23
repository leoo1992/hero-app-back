import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Project } from './project.entity';

@Entity('heros')
export class Hero {
  constructor() {
    this.acesso = 'HERO';
  }

  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ length: 100 })
  nome: string;

  @ApiProperty()
  @Column({ length: 100, unique: true })
  email: string;

  @ApiProperty()
  @Column({ length: 255 })
  senha: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  hero?: string;

  @ApiProperty({ enum: ['HERO', 'ADMIN'] })
  @Column({ default: 'HERO' })
  acesso: 'HERO' | 'ADMIN';

  @ApiProperty({ type: Date, required: false })
  @Column({ type: 'timestamp', nullable: true })
  criado: Date;

  @ApiProperty({ type: Date, required: false })
  @Column({ type: 'timestamp', nullable: true })
  atualizado: Date;

  @ApiProperty({
    type:
      /* istanbul ignore next */
      () => [Project],
  })
  @OneToMany(() => Project, (project) => project.responsavel)
  projects: Project[];
}
