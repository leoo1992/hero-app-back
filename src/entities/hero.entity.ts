import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Project } from './project.entity';
import { HeroType } from 'src/@types/hero/heroType';
import { AcessoType } from 'src/@types/hero/acessoType';
import { Exclude } from 'class-transformer';

@Entity('heros')
export class Hero {
  constructor() {
    this.acesso = AcessoType.HERO;
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
  @Exclude()
  @Column({ length: 255 })
  senha: string;

  @ApiProperty({ enum: HeroType })
  @Column({ type: 'enum', enum: HeroType })
  hero: HeroType;

  @ApiProperty({ enum: AcessoType, example: AcessoType.HERO })
  @Column({ type: 'enum', enum: AcessoType, default: AcessoType.HERO })
  acesso: AcessoType;

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
