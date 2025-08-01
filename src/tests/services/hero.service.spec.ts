import { Test, TestingModule } from '@nestjs/testing';
import { HeroService } from 'src/services/hero.service';
import { DeepPartial, Repository } from 'typeorm';
import { Hero } from 'src/entities/hero.entity';
import { Project } from 'src/entities/project.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ProjectDto } from 'src/dtos/project/project.dto';
import { HeroType } from 'src/@types/hero/heroType';
import { ProjectEstatisticas } from 'src/@types/project/projectEstatisticas';
import { ProjectStatus } from 'src/@types/project/projectStatus';
import { AcessoType } from 'src/@types/hero/acessoType';

describe('HeroService', () => {
  let service: HeroService;
  let heroRepo: jest.Mocked<Repository<Hero>>;
  let projectRepo: jest.Mocked<Repository<Project>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeroService,
        {
          provide: getRepositoryToken(Hero),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Project),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HeroService>(HeroService);
    heroRepo = module.get(getRepositoryToken(Hero));
    projectRepo = module.get(getRepositoryToken(Project));
  });

  describe('criar', () => {
    it('deve lançar BadRequestException se campos obrigatórios não forem preenchidos', async () => {
      await expect(service.create({} as any)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('deve lançar ConflictException se o e-mail já existir', async () => {
      heroRepo.findOne.mockResolvedValue({} as Hero);
      await expect(
        service.create({
          nome: 'Herói',
          email: 'email@exemplo.com',
          senha: 'senha',
          hero: 'Batman' as HeroType,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('deve criar o herói e salvar projetos se fornecidos', async () => {
      heroRepo.findOne.mockResolvedValue(null);
      heroRepo.create.mockImplementation((dto) => dto as any);
      heroRepo.save.mockImplementation(async (hero) => {
        return {
          id: 1,
          nome: hero.nome || 'Nome Default',
          email: hero.email || 'email@default.com',
          senha: hero.senha || 'hashdefault',
          hero: hero.hero,
          acesso: hero.acesso || AcessoType.HERO,
          criado: hero.criado || new Date(),
          atualizado: hero.atualizado || new Date(),
          projects: hero.projects || [],
        } as Hero;
      });

      projectRepo.create.mockImplementation((dto) => dto as any);
      projectRepo.save.mockImplementation(
        async (input: DeepPartial<Project>): Promise<DeepPartial<Project> & Project> => {
          const buildEstatisticas = (
            estatisticas?: DeepPartial<ProjectEstatisticas>,
          ): ProjectEstatisticas => ({
            agilidade: 80,
            encantamento: 90,
            eficiencia: 85,
            excelencia: 75,
            transparencia: 70,
            ambicao: 95,
            ...estatisticas,
          });

          const buildProject = (p: DeepPartial<Project>): Project => ({
            id: p.id ?? 1,
            nome: p.nome ?? 'Projeto Teste',
            descricao: p.descricao ?? 'Descrição Teste',
            status: p.status ?? ProjectStatus.PENDENTE,
            estatisticas: buildEstatisticas(p.estatisticas),
            responsavel: p.responsavel ?? ({} as any),
            criado: p.criado instanceof Date ? p.criado : new Date(),
            atualizado: p.atualizado instanceof Date ? p.atualizado : new Date(),
          });

          return buildProject(input);
        },
      );

      const dto = {
        nome: 'Herói',
        email: 'email@exemplo.com',
        senha: 'senha',
        hero: 'Batman' as HeroType,
        projects: [{ nome: 'projeto1' }] as ProjectDto[],
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('senhaHash' as never);

      const resultado = await service.create(dto);

      expect(resultado).toHaveProperty('id', 1);
      expect(projectRepo.create).toHaveBeenCalledWith({
        nome: 'projeto1',
        responsavel: expect.any(Object),
      });
      expect(projectRepo.save).toHaveBeenCalled();
      expect(heroRepo.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('buscarTodos', () => {
    it('deve chamar find com relacionamento projects', async () => {
      heroRepo.find.mockResolvedValue([]);
      const resultado = await service.findAll();
      expect(heroRepo.find).toHaveBeenCalledWith({ relations: ['projects'] });
      expect(resultado).toEqual([]);
    });
  });

  describe('buscarComFiltros', () => {
    it('deve construir query com filtros e retornar heróis', async () => {
      const queryBuilderMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(['heroi1']),
      };

      heroRepo.createQueryBuilder.mockReturnValue(queryBuilderMock as any);

      const filtros = {
        status: 'ativo',
        hero: 'sp',
        email: 'email@exemplo.com',
        nome: 'Nome',
        id: 1,
      };

      const resultado = await service.findWithFilters(filtros);

      expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledWith('hero.projects', 'project');
      expect(queryBuilderMock.andWhere).toHaveBeenCalledTimes(5);
      expect(queryBuilderMock.getMany).toHaveBeenCalled();
      expect(resultado).toEqual(['heroi1']);
    });
  });

  describe('buscarPorEmail', () => {
    it('deve retornar herói se encontrado', async () => {
      const heroi = { email: 'email@exemplo.com' } as Hero;
      heroRepo.findOne.mockResolvedValue(heroi);

      const resultado = await service.findByEmail('email@exemplo.com');

      expect(heroRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'email@exemplo.com' },
        relations: ['projects'],
      });
      expect(resultado).toBe(heroi);
    });

    it('deve lançar NotFoundException se não encontrado', async () => {
      heroRepo.findOne.mockResolvedValue(null);

      await expect(service.findByEmail('email@exemplo.com')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar herói se encontrado', async () => {
      const heroi = { id: 1 } as Hero;
      heroRepo.findOne.mockResolvedValue(heroi);

      const resultado = await service.findById(1);

      expect(heroRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['projects'],
      });
      expect(resultado).toBe(heroi);
    });

    it('deve lançar NotFoundException se não encontrado', async () => {
      heroRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('deve lançar NotFoundException se findById retornar null', async () => {
      try {
        await service.findById(999);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('atualizar', () => {
    it('deve atualizar o campo acesso se fornecido no DTO', async () => {
      const heroiExistente = {
        id: 1,
        email: 'antigo@exemplo.com',
        nome: 'Nome Antigo',
        senha: 'hashantigo',
        hero: 'heroiAntigo',
        acesso: AcessoType.HERO,
        atualizado: new Date(),
        projects: [],
      } as any;

      heroRepo.findOne.mockResolvedValueOnce(heroiExistente);
      heroRepo.findOne.mockResolvedValueOnce(null);

      heroRepo.save.mockImplementation(async (hero) => hero as Hero);

      const dto = {
        acesso: AcessoType.ADMIN,
      };

      const resultado = await service.update(1, dto);

      expect(resultado.acesso).toBe(AcessoType.ADMIN);
    });

    it('deve atualizar os campos do herói e salvar', async () => {
      const heroiExistente = {
        id: 1,
        email: 'antigo@exemplo.com',
        nome: 'Nome Antigo',
        senha: 'hashantigo',
        hero: 'heroiAntigo',
        atualizado: new Date(),
        projects: [],
      } as any;

      heroRepo.findOne.mockResolvedValueOnce(heroiExistente).mockResolvedValueOnce(null);

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashnovo' as never);
      heroRepo.save.mockImplementation(async (hero) => {
        return {
          id: 1,
          nome: hero.nome || 'Nome Default',
          email: hero.email || 'email@default.com',
          senha: hero.senha || 'hashdefault',
          hero: hero.hero,
          acesso: hero.acesso || AcessoType.HERO,
          criado: hero.criado || new Date(),
          atualizado: hero.atualizado || new Date(),
          projects: hero.projects || [],
        } as Hero;
      });

      const dto = {
        email: 'novo@exemplo.com',
        nome: 'Nome Novo',
        senha: 'novasenha',
        hero: 'Batman' as HeroType,
        projects: [
          {
            nome: 'p1',
            descricao: 'Projeto de teste',
            status: ProjectStatus.PENDENTE,
            estatisticas: {
              agilidade: 90,
              encantamento: 90,
              eficiencia: 90,
              excelencia: 90,
              transparencia: 90,
              ambicao: 90,
            },
            responsavel: 1,
          },
        ],
      };

      projectRepo.create.mockImplementation((p) => p as any);
      projectRepo.save = jest
        .fn()
        .mockImplementation(
          async (
            input: DeepPartial<Project> | DeepPartial<Project>[],
          ): Promise<(DeepPartial<Project> & Project) | (DeepPartial<Project> & Project)[]> => {
            const buildEstatisticas = (
              estatisticas?: DeepPartial<ProjectEstatisticas>,
            ): ProjectEstatisticas => ({
              agilidade: estatisticas?.agilidade ?? 80,
              encantamento: estatisticas?.encantamento ?? 90,
              eficiencia: estatisticas?.eficiencia ?? 85,
              excelencia: estatisticas?.excelencia ?? 75,
              transparencia: estatisticas?.transparencia ?? 70,
              ambicao: estatisticas?.ambicao ?? 95,
            });

            const buildProject = (p: DeepPartial<Project>, i = 1): Project => ({
              id: p.id ?? i,
              nome: p.nome ?? 'Projeto Teste',
              descricao: p.descricao ?? 'Descrição Teste',
              status: p.status ?? ProjectStatus.PENDENTE,
              estatisticas: buildEstatisticas(p.estatisticas),
              responsavel: p.responsavel ?? ({} as any),
              criado: new Date(),
              atualizado: new Date(),
            });

            if (Array.isArray(input)) {
              return input.map((p, i) => buildProject(p, i + 1));
            } else {
              return buildProject(input);
            }
          },
        );

      const resultado = await service.update(1, dto);

      expect(resultado.email).toBe(dto.email.toLowerCase());
      expect(resultado.nome).toBe(dto.nome);
      expect(resultado.senha).toBe('hashnovo');
      expect(resultado.hero).toBe(dto.hero);
      expect(heroRepo.save).toHaveBeenCalled();
      expect(projectRepo.create).toHaveBeenCalled();
      expect(projectRepo.save).toHaveBeenCalled();
    });

    it('deve lançar ConflictException se e-mail já estiver em uso por outro herói', async () => {
      const heroiExistente = { id: 2, email: 'conflito@exemplo.com' } as Hero;
      heroRepo.findOne.mockResolvedValueOnce({} as Hero);
      heroRepo.findOne.mockResolvedValueOnce(heroiExistente);

      await expect(service.update(1, { email: 'conflito@exemplo.com' })).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('deve lançar NotFoundException se herói não for encontrado ao atualizar (caminho interno)', async () => {
      heroRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(1, {
          projects: [
            {
              nome: 'p1',
              descricao: 'Teste',
              status: ProjectStatus.PENDENTE,
              estatisticas: {} as ProjectEstatisticas,
              responsavel: 0,
            },
          ],
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('não deve criar projetos se dto.projects for vazio', async () => {
      const heroiExistente = {
        id: 1,
        email: 'antigo@exemplo.com',
        nome: 'Nome Antigo',
        senha: 'hashantigo',
        hero: 'heroiAntigo',
        atualizado: new Date(),
        projects: [],
      } as any;

      heroRepo.findOne.mockResolvedValueOnce(heroiExistente);
      heroRepo.findOne.mockResolvedValueOnce(null);

      heroRepo.save.mockResolvedValue(heroiExistente);

      const dto = {
        email: 'novo@exemplo.com',
        nome: 'Nome Novo',
        senha: 'novaSenha',
        hero: 'Batman' as HeroType,
        projects: [],
      };

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('senhaHash'));

      const resultado = await service.update(1, dto);

      expect(resultado.email).toBe(dto.email.toLowerCase());
      expect(projectRepo.create).not.toHaveBeenCalled();
      expect(projectRepo.save).not.toHaveBeenCalled();
    });

    it('não deve criar projetos se dto.projects for undefined', async () => {
      const heroiExistente = {
        id: 1,
        email: 'antigo@exemplo.com',
        nome: 'Nome Antigo',
        senha: 'hashantigo',
        hero: 'heroiAntigo',
        atualizado: new Date(),
        projects: [],
      } as any;

      heroRepo.findOne.mockResolvedValueOnce(heroiExistente);
      heroRepo.findOne.mockResolvedValueOnce(null);
      heroRepo.save.mockResolvedValue(heroiExistente);

      const dto = {
        email: 'novo@exemplo.com',
        nome: 'Nome Novo',
        senha: 'novaSenha',
        hero: 'Batman' as HeroType,
      };

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('senhaHash'));

      const resultado = await service.update(1, dto);

      expect(resultado.email).toBe(dto.email.toLowerCase());
      expect(projectRepo.create).not.toHaveBeenCalled();
      expect(projectRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('remover', () => {
    it('deve deletar o herói se existir', async () => {
      heroRepo.findOne.mockResolvedValue({ id: 1 } as Hero);
      heroRepo.delete.mockResolvedValue({} as any);

      await expect(service.delete(1)).resolves.toBeUndefined();

      expect(heroRepo.delete).toHaveBeenCalledWith(1);
    });

    it('deve lançar NotFoundException se o herói não existir', async () => {
      heroRepo.findOne.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
