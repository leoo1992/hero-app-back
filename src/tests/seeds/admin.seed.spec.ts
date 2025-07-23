import * as AdminSeed from '../../seeds/admin.seed';
import { Repository } from 'typeorm';
import { Hero } from '../../entities/hero.entity';
import * as bcrypt from 'bcrypt';

describe('seedAdmin', () => {
  let mockRepo: Partial<Repository<Hero>>;

  beforeEach(() => {
    mockRepo = {
      findOneBy: jest.fn(),
      save: jest.fn(),
    };

    jest.spyOn(AdminSeed.AppDataSource, 'initialize').mockResolvedValue(undefined as any);
    jest.spyOn(AdminSeed.AppDataSource, 'destroy').mockResolvedValue(undefined as any);
    jest.spyOn(AdminSeed.AppDataSource, 'getRepository').mockReturnValue(mockRepo as any);
    jest.spyOn(AdminSeed['logger'], 'warn').mockImplementation(() => {});
    jest.spyOn(AdminSeed['logger'], 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve criar o admin se ele não existir', async () => {
    (mockRepo.findOneBy as jest.Mock).mockResolvedValue(null);
    (mockRepo.save as jest.Mock).mockResolvedValue({});

    await AdminSeed.seedAdmin();

    expect(mockRepo.findOneBy).toHaveBeenCalledWith({ email: 'admin@heroforce.com' });
    expect(mockRepo.save).toHaveBeenCalled();

    const savedAdmin = (mockRepo.save as jest.Mock).mock.calls[0][0];
    expect(savedAdmin.email).toBe('admin@heroforce.com');
    expect(await bcrypt.compare('admin123', savedAdmin.senha)).toBe(true);
  });

  it('não deve recriar se admin já existir', async () => {
    (mockRepo.findOneBy as jest.Mock).mockResolvedValue({ email: 'admin@heroforce.com' });

    await AdminSeed.seedAdmin();

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('deve logar erro se ocorrer exceção durante execução', async () => {
    jest
      .spyOn(AdminSeed.AppDataSource, 'initialize')
      .mockRejectedValue(new Error('Falha na inicialização'));

    const loggerErrorSpy = jest.spyOn(AdminSeed.logger, 'error').mockImplementation(() => {});

    await AdminSeed.seedAdmin();

    expect(loggerErrorSpy).toHaveBeenCalledWith('Erro ao executar seedAdmin:', expect.any(Error));

    loggerErrorSpy.mockRestore();
  });
});
