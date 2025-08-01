import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectStatus } from 'src/@types/project/projectStatus';
import { ProjectController } from 'src/controllers/project.controller';
import { Project } from 'src/entities/project.entity';
import { JwtBlacklistGuard } from 'src/guards/jwt-blacklist.guard';
import { ProjectService } from 'src/services/project.service';

@Injectable()
class MockGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

describe('ProjectController', () => {
  let controller: ProjectController;
  let service: ProjectService;

  const projetoMock: Project = {
    id: 1,
    nome: 'Projeto Alpha',
    descricao: 'Um projeto secreto',
    status: ProjectStatus.ANDAMENTO,
    responsavel: { id: 1 } as any,
    estatisticas: {
      agilidade: 0,
      encantamento: 0,
      eficiencia: 0,
      excelencia: 0,
      transparencia: 0,
      ambicao: 0,
    },
    criado: new Date(),
    atualizado: new Date(),
  };

  const serviceMock = {
    create: jest.fn(),
    findById: jest.fn(),
    findWithFilters: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getProgresso: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: serviceMock,
        },
      ],
    })
      .overrideGuard(JwtBlacklistGuard)
      .useClass(MockGuard)
      .compile();

    controller = module.get<ProjectController>(ProjectController);
    service = module.get<ProjectService>(ProjectService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve criar um novo projeto', async () => {
    service.create = jest.fn().mockResolvedValue(projetoMock);

    const dto = {
      nome: 'Projeto Alpha',
      descricao: 'Um projeto secreto',
      status: 'ANDAMENTO',
      responsavel: 1,
      estatisticas: {},
    };

    const resultado = await controller.create(dto as any);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(resultado).toEqual(projetoMock);
  });

  it('deve buscar um projeto por ID', async () => {
    service.findById = jest.fn().mockResolvedValue(projetoMock);
    service.getProgresso = jest.fn().mockReturnValue(75);

    const resultado = await controller.findById(1);

    expect(service.findById).toHaveBeenCalledWith(1);
    expect(service.getProgresso).toHaveBeenCalledWith(projetoMock);
    expect(resultado.progresso).toBe(75);
    expect(resultado).toEqual({
      ...projetoMock,
      progresso: 75,
    });
  });

  it('deve listar projetos com filtros', async () => {
    service.findWithFilters = jest.fn().mockResolvedValue([projetoMock]);
    service.getProgresso = jest.fn().mockReturnValue(75);

    const filtros = { status: 'ANDAMENTO', responsavelId: 1, nome: 'Alpha', descricao: 'secreto' };

    const resultado = await controller.findAll(
      filtros.status,
      filtros.responsavelId,
      filtros.nome,
      filtros.descricao,
    );

    expect(service.findWithFilters).toHaveBeenCalledWith(filtros);
    expect(service.getProgresso).toHaveBeenCalledWith(projetoMock);
    expect(resultado).toEqual([
      {
        ...projetoMock,
        progresso: 75,
      },
    ]);
  });

  it('deve atualizar um projeto por ID', async () => {
    const atualizado = { ...projetoMock, nome: 'Projeto Atualizado' };
    service.update = jest.fn().mockResolvedValue(atualizado);

    const dto = { nome: 'Projeto Atualizado' };

    const resultado = await controller.update(1, dto);

    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(resultado).toEqual(atualizado);
  });

  it('deve remover um projeto por ID', async () => {
    service.delete = jest.fn().mockResolvedValue(undefined);

    await controller.delete(1);

    expect(service.delete).toHaveBeenCalledWith(1);
  });
});
