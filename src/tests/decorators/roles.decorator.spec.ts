import { AcessoType } from 'src/@types/hero/acessoType';
import { ROLES_KEY, Roles } from '../../decorators/roles.decorator';
import { SetMetadata } from '@nestjs/common';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Roles decorator', () => {
  it('deve chamar SetMetadata com a chave correta e os roles fornecidos', () => {
    const roles = [AcessoType.ADMIN, AcessoType.HERO];
    Roles(...roles);

    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, roles);
  });
});
