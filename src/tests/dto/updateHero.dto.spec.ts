import { validate } from 'class-validator';
import { EstatisticasDto, ProjectDto } from 'src/dtos/project.dto';
import { UpdateHeroDto } from 'src/dtos/updateHero.dto';

describe('UpdateHeroDto', () => {
  it('deve validar com dados válidos', async () => {
    const dto = new UpdateHeroDto();
    dto.nome = 'Tony Stark';
    dto.email = 'tony@stark.com';
    dto.senha = 'senha123';
    dto.hero = 'Homem de Ferro';

    const estatisticas = new EstatisticasDto();
    estatisticas.agilidade = 90;
    estatisticas.encantamento = 80;
    estatisticas.eficiencia = 85;
    estatisticas.excelencia = 95;
    estatisticas.transparencia = 75;
    estatisticas.ambicao = 88;

    const project = new ProjectDto();
    project.nome = 'Projeto Iniciativa Vingadores';
    project.descricao = 'Reunir os heróis mais poderosos da Terra';
    project.status = 'PENDENTE';
    project.estatisticas = estatisticas;
    project.responsavel = 1;

    dto.projects = [project];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve permitir dto parcial (campos opcionais)', async () => {
    const dto = new UpdateHeroDto();
    dto.nome = 'Bruce Banner'; // apenas um campo

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve falhar com email inválido', async () => {
    const dto = new UpdateHeroDto();
    dto.email = 'email-invalido';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('deve falhar com senha muito curta', async () => {
    const dto = new UpdateHeroDto();
    dto.senha = '123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('senha');
  });

  it('deve falhar com projects inválidos', async () => {
    const dto = new UpdateHeroDto();
    dto.projects = [{} as ProjectDto]; // objeto incompleto

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('projects');
  });
});
