import { Hero } from '../../entities/hero.entity';

describe('Entidade Hero', () => {
  it('deve criar uma instância com as propriedades corretamente', () => {
    const hero = new Hero();

    hero.id = 1;
    hero.nome = 'Batman';
    hero.email = 'batman@example.com';
    hero.senha = 'hashedpassword';
    hero.hero = 'Dark Knight';
    hero.acesso = 'ADMIN';
    hero.criado = new Date('2025-07-18T12:00:00Z');
    hero.atualizado = new Date('2025-07-19T12:00:00Z');
    hero.projects = [];

    expect(hero.id).toBe(1);
    expect(hero.nome).toBe('Batman');
    expect(hero.email).toBe('batman@example.com');
    expect(hero.senha).toBe('hashedpassword');
    expect(hero.hero).toBe('Dark Knight');
    expect(hero.acesso).toBe('ADMIN');
    expect(hero.criado.toISOString()).toBe('2025-07-18T12:00:00.000Z');
    expect(hero.atualizado.toISOString()).toBe('2025-07-19T12:00:00.000Z');
    expect(hero.projects).toEqual([]);
  });

  it('deve atribuir o valor padrão "HERO" para acesso', () => {
    const hero = new Hero();
    expect(hero.acesso).toBe('HERO');
  });
});
