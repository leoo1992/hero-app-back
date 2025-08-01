import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ProjectDto } from 'src/dtos/project/project.dto';

describe('ProjectDto', () => {
  const validPayload = {
    nome: 'Sistema de CRM',
    descricao: 'Projeto para gerenciamento de relacionamento com o cliente',
    status: 'PENDENTE',
    responsavel: 1,
    estatisticas: {
      agilidade: 80,
      encantamento: 90,
      eficiencia: 85,
      excelencia: 70,
      transparencia: 95,
      ambicao: 75,
    },
  };

  it('should validate with valid data', async () => {
    const dto = plainToInstance(ProjectDto, validPayload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if required fields are missing or empty', async () => {
    const dto = plainToInstance(ProjectDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const fields = errors.map((e) => e.property);
    expect(fields).toEqual(
      expect.arrayContaining(['nome', 'descricao', 'status', 'responsavel', 'estatisticas']),
    );
  });

  it('should fail if status is invalid', async () => {
    const payload = { ...validPayload, status: 'INVALIDO' };
    const dto = plainToInstance(ProjectDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isEnum).toContain(
      'status deve ser PENDENTE, ANDAMENTO ou CONCLUIDO',
    );
  });

  it('should fail if estatisticas values are out of range', async () => {
    const payload = {
      ...validPayload,
      estatisticas: {
        agilidade: -1,
        encantamento: 200,
        eficiencia: 150,
        excelencia: 300,
        transparencia: -50,
        ambicao: 999,
      },
    };
    const dto = plainToInstance(ProjectDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'estatisticas')).toBeDefined();
  });

  it('should fail if responsavel is not an integer', async () => {
    const payload = { ...validPayload, responsavel: 'abc' };
    const dto = plainToInstance(ProjectDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.find((e) => e.property === 'responsavel')).toBeDefined();
  });
});
