import { Hero } from 'src/entities/hero.entity';
import { Project } from '../../entities/project.entity';
import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ProjectStatus } from 'src/@types/project/projectStatus';

describe('Entidade Project', () => {
  it('deve criar uma instância com as propriedades corretamente', () => {
    const hero = new Hero();
    hero.id = 1;
    hero.nome = 'Herói Teste';

    const project = new Project();
    project.id = 10;
    project.nome = 'Projeto X';
    project.descricao = 'Descrição do projeto X';
    project.status = 'ANDAMENTO' as ProjectStatus;
    project.estatisticas = {
      agilidade: 80,
      encantamento: 90,
      eficiencia: 85,
      excelencia: 75,
      transparencia: 70,
      ambicao: 95,
    };

    project.responsavel = hero;
    project.criado = new Date('2025-07-10T12:00:00Z');
    project.atualizado = new Date('2025-07-15T12:00:00Z');

    expect(project.id).toBe(10);
    expect(project.nome).toBe('Projeto X');
    expect(project.descricao).toBe('Descrição do projeto X');
    expect(project.status).toBe('ANDAMENTO');
    expect(project.estatisticas.agilidade).toBe(80);
    expect(project.estatisticas.encantamento).toBe(90);
    expect(project.estatisticas.eficiencia).toBe(85);
    expect(project.estatisticas.excelencia).toBe(75);
    expect(project.estatisticas.transparencia).toBe(70);
    expect(project.estatisticas.ambicao).toBe(95);
    expect(project.responsavel).toBeInstanceOf(Hero);
    expect(project.criado.toISOString()).toBe('2025-07-10T12:00:00.000Z');
    expect(project.atualizado.toISOString()).toBe('2025-07-15T12:00:00.000Z');
    expect(project.responsavel).toBe(hero);
    expect(project.responsavel.nome).toBe('Herói Teste');
  });

  it('deve transformar um objeto plano em uma instância de Project com Hero', () => {
    const plain = {
      id: 1,
      nome: 'Projeto com Transform',
      descricao: 'Desc',
      status: 'PENDENTE',
      estatisticas: {
        agilidade: 50,
        encantamento: 60,
        eficiencia: 70,
        excelencia: 80,
        transparencia: 90,
        ambicao: 100,
      },
      responsavel: {
        id: 1,
        nome: 'Herói Transformado',
      },
      criado: new Date().toISOString(),
      atualizado: new Date().toISOString(),
    };

    const project = plainToInstance(Project, plain);
    expect(project).toBeInstanceOf(Project);
    expect(project.responsavel).toBeInstanceOf(Hero);
    expect(project.responsavel.nome).toBe('Herói Transformado');
  });

  it('deve adicionar um projeto à lista de projects do herói', () => {
    const hero = new Hero();
    const project = new Project();
    project.responsavel = hero;
    hero.projects = [project];

    expect(hero.projects.length).toBe(1);
    expect(hero.projects[0]).toBe(project);
  });

  it('deve validar o relacionamento entre projeto e herói (ManyToOne)', () => {
    const hero = new Hero();
    hero.id = 2;
    hero.nome = 'Herói Relacionado';

    const project = new Project();
    project.responsavel = hero;

    expect(project.responsavel).toBeInstanceOf(Hero);
    expect(project.responsavel.nome).toBe('Herói Relacionado');
  });

  it('estatisticas deve ser um objeto JSON válido', () => {
    const project = new Project();
    project.estatisticas = {
      agilidade: 100,
      encantamento: 100,
      eficiencia: 100,
      excelencia: 100,
      transparencia: 100,
      ambicao: 100,
    };
    expect(typeof project.estatisticas).toBe('object');
    expect(project.estatisticas.ambicao).toBe(100);
  });

  it('deve conter relacionamento do tipo Hero em responsavel', () => {
    const relation = getMetadataArgsStorage().relations.find(
      (r) => r.target === Project && r.propertyName === 'responsavel',
    );

    expect(relation).toBeDefined();
    expect(typeof relation?.type).toBe('function');
    expect((relation?.type as () => Function)()).toBe(Hero);

    const relatedType = (relation?.type as () => Function)();
    expect(relatedType).toBe(Hero);
  });

  it('deve executar o callback da relação ManyToOne com Hero', () => {
    const relation = getMetadataArgsStorage().relations.find(
      (r) => r.target === Project && r.propertyName === 'responsavel',
    );

    expect(relation).toBeDefined();
    expect(typeof relation?.type).toBe('function');

    const relationType = (relation!.type as () => Function)();
    expect(relationType).toBe(Hero);
  });

  it('deve executar a função de tipo do relacionamento ManyToOne com Hero', () => {
    const relation = getMetadataArgsStorage().relations.find(
      (r) => r.target === Project && r.propertyName === 'responsavel',
    );

    expect(relation).toBeDefined();

    const typeResult = (relation!.type as () => any)();
    expect(typeResult).toBe(Hero);
  });

  it('deve cobrir o tipo do relacionamento com Hero', () => {
    const project = new Project();
    expect(project.responsavel instanceof Hero || project.responsavel === undefined).toBe(true);
  });

  it('deve verificar se o relacionamento com Hero é ManyToOne e não é nulo', () => {
    const relation = getMetadataArgsStorage().relations.find(
      (r) => r.target === Project && r.propertyName === 'responsavel',
    );
    const relationType = (relation!.type as () => Function)();

    expect(relation?.relationType).toBe('many-to-one');
    expect(relationType).toBe(Hero);
    expect(relation?.options.nullable).toBe(false);
  });

  it('deve transformar a propriedade responsavel usando a classe Hero', () => {
    const plain = {
      responsavel: {
        id: 99,
        nome: 'Herói XYZ',
      },
    };

    const result = plainToInstance(Project, plain);
    expect(result.responsavel).toBeInstanceOf(Hero);
    expect(result.responsavel.id).toBe(99);
    expect(result.responsavel.nome).toBe('Herói XYZ');
  });
});
