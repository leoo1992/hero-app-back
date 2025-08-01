import { Hero } from 'src/entities/hero.entity';
import { Project } from 'src/entities/project.entity';
import { plainToInstance } from 'class-transformer';
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { AcessoType } from 'src/@types/hero/acessoType';
import { HeroType } from 'src/@types/hero/heroType';

describe('Hero Entity', () => {
  it('deve instanciar com valor padrão "HERO" para acesso', () => {
    const hero = new Hero();
    expect(hero.acesso).toBe(AcessoType.HERO);
  });

  it('deve aceitar todos os campos definidos manualmente', () => {
    const hero = new Hero();
    hero.id = 1;
    hero.nome = 'Diana Prince';
    hero.email = 'diana@amazon.com';
    hero.senha = 'senha123';
    hero.hero = HeroType.MULHER_MARAVILHA;
    hero.acesso = AcessoType.ADMIN;
    hero.criado = new Date('2024-01-01T12:00:00Z');
    hero.atualizado = new Date('2024-06-01T12:00:00Z');

    expect(hero.nome).toBe('Diana Prince');
    expect(hero.acesso).toBe(AcessoType.ADMIN);
    expect(hero.criado.toISOString()).toBe('2024-01-01T12:00:00.000Z');
    expect(hero.atualizado.toISOString()).toBe('2024-06-01T12:00:00.000Z');
  });

  it('deve aceitar um array de projetos (relação OneToMany)', () => {
    const hero = new Hero();
    const project1 = new Project();
    const project2 = new Project();

    project1.nome = 'Projeto 1';
    project2.nome = 'Projeto 2';

    hero.projects = [project1, project2];

    expect(hero.projects.length).toBe(2);
    expect(hero.projects[0].nome).toBe('Projeto 1');
  });

  it('deve transformar um objeto literal em Hero com plainToInstance', () => {
    const raw = {
      nome: 'Steve Rogers',
      email: 'steve@avengers.com',
      senha: 'captain123',
    };

    const hero = plainToInstance(Hero, raw);
    expect(hero).toBeInstanceOf(Hero);
    expect(hero.nome).toBe('Steve Rogers');
  });

  it('deve ter metadata do relacionamento OneToMany com Project', () => {
    const relation = Reflect.getMetadata('design:type', new Hero(), 'projects');
    expect(relation).toBe(Array);
  });

  it('deve verificar se existe o decorator OneToMany no campo projects', () => {
    const metadataKeys = Reflect.getMetadataKeys(new Hero(), 'projects');
    expect(metadataKeys).toContain('design:type');
  });

  it('deve registrar a relação OneToMany com Project', () => {
    const relations = getMetadataArgsStorage().relations.find(
      (rel) => rel.target === Hero && rel.propertyName === 'projects',
    );

    const relationType = (relations!.type as () => Function)();

    expect(relations).toBeDefined();
    expect(relations?.relationType).toBe('one-to-many');
    expect(relationType).toBe(Project);
  });

  it('deve validar a função inversa do relacionamento OneToMany', () => {
    const relations = getMetadataArgsStorage().relations.find(
      (rel) => rel.target === Hero && rel.propertyName === 'projects',
    );

    expect(relations).toBeDefined();

    const inverseSide = relations?.inverseSideProperty as (project: Project) => any;
    const project = new Project();
    project.responsavel = new Hero();

    expect(inverseSide(project)).toBe(project.responsavel);
  });
});
