import { validate } from 'class-validator';
import { HeroDto } from '../../dtos/hero.dto';
import { EstatisticasDto, ProjectDto } from '../../dtos/project.dto';
import { plainToInstance } from 'class-transformer';

describe('HeroDto', () => {
  it('deve validar com dados válidos', async () => {
    const plainObject = {
      nome: 'Lucas Silva',
      email: 'lucas@email.com',
      senha: '12345678',
      projects: [
        {
          nome: 'Projeto 1',
          descricao: 'Descrição',
          status: 'PENDENTE',
          responsavel: 1,
          estatisticas: {
            agilidade: 80,
            encantamento: 90,
            eficiencia: 85,
            excelencia: 75,
            transparencia: 70,
            ambicao: 95,
          },
        },
      ],
    };

    const dto = plainToInstance(HeroDto, plainObject);
    dto.nome = 'Lucas Silva';
    dto.email = 'lucas@email.com';
    dto.senha = '12345678';
    dto.hero = 'Super Herói';

    const estatisticas = new EstatisticasDto();
    estatisticas.agilidade = 80;
    estatisticas.encantamento = 90;
    estatisticas.eficiencia = 85;
    estatisticas.excelencia = 75;
    estatisticas.transparencia = 70;
    estatisticas.ambicao = 95;

    const project = new ProjectDto();
    project.nome = 'Projeto 1';
    project.descricao = 'Descrição do projeto';
    project.status = 'PENDENTE';
    project.estatisticas = estatisticas;
    project.responsavel = 1;

    dto.projects = [project];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve falhar se nome estiver vazio', async () => {
    const dto = new HeroDto();
    dto.nome = '';
    dto.email = 'lucas@email.com';
    dto.senha = '12345678';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'nome')).toBe(true);
  });

  it('deve falhar se email não for válido', async () => {
    const dto = new HeroDto();
    dto.nome = 'Lucas Silva';
    dto.email = 'email-invalido';
    dto.senha = '12345678';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('deve falhar se senha for menor que 6 caracteres', async () => {
    const dto = new HeroDto();
    dto.nome = 'Lucas Silva';
    dto.email = 'lucas@email.com';
    dto.senha = '123';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'senha')).toBe(true);
  });

  it('deve aceitar hero opcionalmente', async () => {
    const dto = new HeroDto();
    dto.nome = 'Lucas Silva';
    dto.email = 'lucas@email.com';
    dto.senha = '12345678';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'hero')).toBe(false);
  });

  it('deve falhar se projects não for um array', async () => {
    const dto = new HeroDto();
    dto.nome = 'Lucas Silva';
    dto.email = 'lucas@email.com';
    dto.senha = '12345678';
    // @ts-expect-error forçar valor inválido
    dto.projects = 'não é um array';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'projects')).toBe(true);
  });

  it('deve falhar se um projeto dentro de projects estiver inválido', async () => {
    const dto = new HeroDto();
    dto.nome = 'Lucas Silva';
    dto.email = 'lucas@email.com';
    dto.senha = '12345678';

    dto.projects = [{} as ProjectDto];

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'projects')).toBe(true);
  });

  it('deve aceitar ausência de projects', async () => {
    const dto = new HeroDto();
    dto.nome = 'Lucas Silva';
    dto.email = 'lucas@email.com';
    dto.senha = '12345678';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'projects')).toBe(false);
  });

  it('deve falhar se nome estiver ausente', async () => {
    const dto = new HeroDto();
    dto.email = 'lucas@email.com';
    dto.senha = '12345678';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'nome')).toBe(true);
  });

  it('deve falhar se email estiver ausente', async () => {
    const dto = new HeroDto();
    dto.nome = 'Lucas Silva';
    dto.senha = '12345678';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('deve falhar se senha estiver ausente', async () => {
    const dto = new HeroDto();
    dto.nome = 'Lucas Silva';
    dto.email = 'lucas@email.com';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'senha')).toBe(true);
  });

  it('deve falhar se hero não for string', async () => {
    const dto = new HeroDto();
    dto.nome = 'Lucas Silva';
    dto.email = 'lucas@email.com';
    dto.senha = '12345678';
    // @ts-expect-error forçar erro
    dto.hero = 123;

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'hero')).toBe(true);
  });

  it('deve validar com dados válidos usando plainToInstance (ativa @Type)', async () => {
    const plainObject = {
      nome: 'Lucas Silva',
      email: 'lucas@email.com',
      senha: '12345678',
      hero: 'Super Herói',
      projects: [
        {
          nome: 'Projeto 1',
          descricao: 'Descrição do projeto',
          status: 'PENDENTE',
          responsavel: 1,
          estatisticas: {
            agilidade: 80,
            encantamento: 90,
            eficiencia: 85,
            excelencia: 75,
            transparencia: 70,
            ambicao: 95,
          },
        },
      ],
    };

    const dto = plainToInstance(HeroDto, plainObject);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
