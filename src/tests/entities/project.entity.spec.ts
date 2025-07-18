import { Hero } from 'src/entities/hero.entity';
import { Project, TProjectStatus } from '../../entities/project.entity';

describe('Entidade Project', () => {
  it('deve criar uma instância com as propriedades corretamente', () => {
    const project = new Project();

    project.id = 10;
    project.nome = 'Projeto X';
    project.descricao = 'Descrição do projeto X';
    project.status = 'ANDAMENTO' as TProjectStatus;
    project.estatisticas = {
      agilidade: 80,
      encantamento: 90,
      eficiencia: 85,
      excelencia: 75,
      transparencia: 70,
      ambicao: 95,
    };
    project.responsavel = new Hero();
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
  });

  it('deve adicionar um projeto à lista de projects do herói', () => {
    const hero = new Hero();
    const project = new Project();
    project.responsavel = hero;
    hero.projects = [project];

    expect(hero.projects.length).toBe(1);
    expect(hero.projects[0]).toBe(project);
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
});
