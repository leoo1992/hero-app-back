import { validate } from 'class-validator';
import { LoginDto } from '../../dtos/login.dto';

describe('LoginDto', () => {
  it('deve validar com dados válidos', async () => {
    const dto = new LoginDto();
    dto.email = 'admin@heroforce.com';
    dto.senha = 'admin123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve falhar se email for inválido', async () => {
    const dto = new LoginDto();
    dto.email = 'email-invalido';
    dto.senha = 'admin123';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('deve falhar se senha estiver vazia', async () => {
    const dto = new LoginDto();
    dto.email = 'admin@heroforce.com';
    dto.senha = '';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'senha')).toBe(true);
  });

  it('deve falhar se senha não for string', async () => {
    const dto = new LoginDto();
    dto.email = 'admin@heroforce.com';
    // @ts-expect-error intencional para teste
    dto.senha = 123456;

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'senha')).toBe(true);
  });
});
