import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from 'src/services/project.service';
import { HeroService } from 'src/services/hero.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project, TProjectStatus } from 'src/entities/project.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProjectDto } from 'src/dtos/project.dto';

describe('ProjectService', () => {
  let service: ProjectService;
  let projectRepo: any;
  let heroService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getRepositoryToken(Project),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: HeroService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    projectRepo = module.get(getRepositoryToken(Project));
    heroService = module.get(HeroService);
  });

  describe('ProjectService.getProgresso', () => {
    const fakeRepository = {} as any;
    const fakeHeroService = {} as any;
    const service = new ProjectService(fakeRepository, fakeHeroService);

    it('deve calcular corretamente a média das estatísticas', () => {
      const projeto = {
        estatisticas: {
          agilidade: 80,
          encantamento: 90,
          eficiencia: 85,
          excelencia: 75,
          transparencia: 70,
          ambicao: 95,
        },
      } as Project;

      expect(service.getProgresso(projeto)).toBe(83);
    });

    it('deve retornar 0 se não houver estatísticas', () => {
      const projeto = { estatisticas: {} } as Project;
      expect(service.getProgresso(projeto)).toBe(0);
    });

    it('deve retornar 0 se estatísticas forem undefined', () => {
      const projeto = {} as Project;
      expect(service.getProgresso(projeto)).toBe(0);
    });
  });

  describe('create', () => {
    it('deve lançar BadRequestException se nome estiver vazio', async () => {
      const dto: ProjectDto = {
        nome: '',
        status: 'PENDENTE',
        responsavel: 1,
        descricao: 'desc',
        estatisticas: {
          agilidade: 0,
          encantamento: 0,
          eficiencia: 0,
          excelencia: 0,
          transparencia: 0,
          ambicao: 0,
        },
      };

      await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('deve lançar BadRequestException se status estiver vazio', async () => {
      const dto = {
        nome: 'Projeto',
        status: '' as any,
        responsavel: 1,
        descricao: 'desc',
        estatisticas: {
          agilidade: 0,
          encantamento: 0,
          eficiencia: 0,
          excelencia: 0,
          transparencia: 0,
          ambicao: 0,
        },
      };

      await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('deve lançar BadRequestException se responsavel não for informado', async () => {
      await expect(
        service.create({
          nome: 'Projeto',
          status: 'PENDENTE',
          descricao: 'desc',
          estatisticas: {
            agilidade: 0,
            encantamento: 0,
            eficiencia: 0,
            excelencia: 0,
            transparencia: 0,
            ambicao: 0,
          },
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('deve lançar NotFoundException se responsável não existir', async () => {
      heroService.findById.mockResolvedValue(null);

      await expect(
        service.create({
          nome: 'Projeto',
          status: 'PENDENTE',
          responsavel: 1,
          descricao: 'Descrição qualquer',
          estatisticas: {
            agilidade: 0,
            encantamento: 0,
            eficiencia: 0,
            excelencia: 0,
            transparencia: 0,
            ambicao: 0,
          },
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('deve criar projeto corretamente', async () => {
      const dto: ProjectDto = {
        nome: 'Projeto Teste',
        status: 'PENDENTE',
        responsavel: 1,
        descricao: 'Descrição',
        estatisticas: {
          agilidade: 0,
          encantamento: 0,
          eficiencia: 0,
          excelencia: 0,
          transparencia: 0,
          ambicao: 0,
        },
      };
      const responsavelMock = { id: 1, nome: 'Herói' } as any;

      heroService.findById.mockResolvedValue(responsavelMock);
      projectRepo.create.mockImplementation((input: any) => input);
      projectRepo.save.mockImplementation(async (p: any) => ({ id: 1, ...p }));

      const resultado = await service.create(dto);

      expect(heroService.findById).toHaveBeenCalledWith(dto.responsavel);
      expect(projectRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: dto.nome,
          status: dto.status,
          descricao: dto.descricao,
          estatisticas: dto.estatisticas,
          responsavel: responsavelMock,
          criado: expect.any(Date),
          atualizado: expect.any(Date),
        }),
      );
      expect(projectRepo.save).toHaveBeenCalled();
      expect(resultado).toHaveProperty('id', 1);
      expect(resultado).toHaveProperty('nome', dto.nome);
    });

    it('deve criar projeto mesmo sem descrição (usa fallback)', async () => {
      const dto: ProjectDto = {
        nome: 'Projeto Sem Descrição',
        status: 'PENDENTE',
        responsavel: 1,
        descricao: '',
        estatisticas: {
          agilidade: 0,
          encantamento: 0,
          eficiencia: 0,
          excelencia: 0,
          transparencia: 0,
          ambicao: 0,
        },
      };

      const responsavelMock = { id: 1, nome: 'Herói' } as any;

      heroService.findById.mockResolvedValue(responsavelMock);
      projectRepo.create.mockImplementation((input: any) => input);
      projectRepo.save.mockImplementation(async (p: any) => ({ id: 1, ...p }));

      const resultado = await service.create(dto as any);

      expect(projectRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          descricao: '',
        }),
      );
      expect(resultado.descricao).toBe('');
    });
  });

  describe('findWithFilters', () => {
    let queryBuilderMock: any;

    beforeEach(() => {
      queryBuilderMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(['projeto1']),
      };
      projectRepo.createQueryBuilder.mockReturnValue(queryBuilderMock);
    });

    it('deve retornar projetos com filtros aplicados', async () => {
      const filtros = {
        status: 'PENDENTE',
        responsavelId: 2,
        nome: 'Teste',
        descricao: 'Descrição',
        criadoAntes: '2025-01-01',
        criadoDepois: '2024-01-01',
        atualizadoAntes: '2025-01-01',
        atualizadoDepois: '2024-01-01',
      };

      const resultado = await service.findWithFilters(filtros);

      expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledWith(
        'project.responsavel',
        'responsavel',
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledTimes(8);
      expect(queryBuilderMock.getMany).toHaveBeenCalled();
      expect(resultado).toEqual(['projeto1']);
    });

    it('deve lançar BadRequestException se responsavelId não for número', async () => {
      await expect(service.findWithFilters({ responsavelId: NaN })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException para datas inválidas', async () => {
      await expect(
        service.findWithFilters({ criadoAntes: 'data-invalida' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('deve aplicar filtro apenas por nome', async () => {
      const queryBuilderMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(['projeto1']),
      };
      projectRepo.createQueryBuilder.mockReturnValue(queryBuilderMock);

      const resultado = await service.findWithFilters({ nome: 'Exemplo' });

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith('project.nome ILIKE :nome', {
        nome: '%Exemplo%',
      });
      expect(resultado).toEqual(['projeto1']);
    });
  });

  describe('findAll', () => {
    it('deve chamar find com relação responsavel', async () => {
      projectRepo.find.mockResolvedValue([]);
      const resultado = await service.findAll();

      expect(projectRepo.find).toHaveBeenCalledWith({ relations: ['responsavel'] });
      expect(resultado).toEqual([]);
    });
  });

  describe('findById', () => {
    it('deve lançar BadRequestException para id inválido', async () => {
      await expect(service.findById(NaN)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('deve lançar NotFoundException se projeto não encontrado', async () => {
      projectRepo.findOne.mockResolvedValue(null);
      await expect(service.findById(1)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('deve retornar projeto se encontrado', async () => {
      const projeto = { id: 1, nome: 'Teste' } as Project;
      projectRepo.findOne.mockResolvedValue(projeto);

      const resultado = await service.findById(1);

      expect(projectRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['responsavel'],
      });
      expect(resultado).toBe(projeto);
    });
  });

  describe('update', () => {
    it('deve atualizar projeto com dados válidos', async () => {
      const projetoExistente = {
        id: 1,
        nome: 'Antigo',
        descricao: 'Desc antiga',
        status: 'PENDENTE',
        estatisticas: {},
        responsavel: { id: 1 },
        atualizado: new Date(),
      } as any;

      projectRepo.findOne.mockResolvedValue(projetoExistente);
      heroService.findById.mockResolvedValue({ id: 2 } as any);
      projectRepo.save.mockImplementation(async (p: any) => p);

      const dto: Partial<ProjectDto> = {
        nome: 'Novo Nome',
        descricao: 'Nova Desc',
        status: 'ANDAMENTO' as TProjectStatus,
        estatisticas: {
          agilidade: 100,
          encantamento: 0,
          eficiencia: 0,
          excelencia: 0,
          transparencia: 0,
          ambicao: 0,
        },
        responsavel: 2,
      };

      const resultado = await service.update(1, dto);

      expect(projectRepo.findOne).toHaveBeenCalled();
      expect(heroService.findById).toHaveBeenCalledWith(dto.responsavel);
      expect(projectRepo.save).toHaveBeenCalled();
      expect(resultado.nome).toBe(dto.nome);
      expect(resultado.descricao).toBe(dto.descricao);
      expect(resultado.status).toBe(dto.status);
      expect(resultado.estatisticas).toEqual(dto.estatisticas);
      expect(resultado.responsavel.id).toBe(dto.responsavel);
    });

    it('deve lançar NotFoundException se responsável não existir ao atualizar', async () => {
      projectRepo.findOne.mockResolvedValue({} as Project);
      heroService.findById.mockResolvedValue(null);

      await expect(service.update(1, { responsavel: 99 })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException se nome vazio ao atualizar', async () => {
      projectRepo.findOne.mockResolvedValue({} as Project);

      await expect(service.update(1, { nome: '   ' })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('deve lançar BadRequestException se status inválido ao atualizar', async () => {
      projectRepo.findOne.mockResolvedValue({} as Project);

      await expect(service.update(1, { status: 'INVALIDO' as any })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('deve definir descrição como string vazia se descrição não for informada', async () => {
      const projetoExistente = {
        id: 1,
        nome: 'Projeto',
        descricao: 'Antiga',
        status: 'PENDENTE',
        estatisticas: {},
        responsavel: { id: 1 },
        atualizado: new Date(),
      } as any;

      projectRepo.findOne.mockResolvedValue(projetoExistente);
      heroService.findById.mockResolvedValue({ id: 1 });
      projectRepo.save.mockResolvedValue(projetoExistente);

      const resultado = await service.update(1, { descricao: undefined });

      expect(resultado.descricao).toBe('');
    });

    it('deve lançar BadRequestException se status estiver em branco ao atualizar', async () => {
      projectRepo.findOne.mockResolvedValue({} as Project);

      await expect(service.update(1, { status: '   ' as TProjectStatus })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('deve atualizar status corretamente mesmo com espaços em branco', async () => {
      const projetoExistente = {
        id: 1,
        status: 'PENDENTE',
        atualizado: new Date(),
      } as any;

      projectRepo.findOne.mockResolvedValue(projetoExistente);
      projectRepo.save.mockImplementation((p: any) => Promise.resolve(p));

      const resultado = await service.update(1, { status: ' CONCLUIDO ' as TProjectStatus });

      expect(resultado.status).toBe('CONCLUIDO');
    });
  });

  describe('delete', () => {
    it('deve lançar BadRequestException para id inválido', async () => {
      await expect(service.delete(NaN)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('deve lançar NotFoundException se projeto não existir ao deletar', async () => {
      projectRepo.delete.mockResolvedValue({ affected: 0 } as any);
      await expect(service.delete(1)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('deve deletar projeto com sucesso', async () => {
      projectRepo.delete.mockResolvedValue({ affected: 1 } as any);
      await expect(service.delete(1)).resolves.toBeUndefined();
      expect(projectRepo.delete).toHaveBeenCalledWith(1);
    });
  });
});
