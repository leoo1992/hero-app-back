import { Test, TestingModule } from '@nestjs/testing';
import { HeroController } from '../../../src/controllers/hero.controller';
import { HeroService } from '../../../src/services/hero.service';
import { Hero } from '../../../src/entities/hero.entity';
import { HeroDto } from '../../../src/dtos/hero.dto';
import { UpdateHeroDto } from '../../../src/dtos/updateHero.dto';
import { JwtBlacklistGuard } from '../../../src/guards/jwt-blacklist.guard';
import { JwtBlacklistService } from '../../../src/services/jwt-blacklist.service';

describe('HeroController', () => {
  let controller: HeroController;
  let service: jest.Mocked<HeroService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeroController],
      providers: [
        {
          provide: HeroService,
          useValue: {
            create: jest.fn(),
            findWithFilters: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: JwtBlacklistService,
          useValue: {
            isBlacklisted: jest.fn().mockReturnValue(false),
          },
        },
        {
          provide: JwtBlacklistGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
      ],
    }).compile();

    controller = module.get<HeroController>(HeroController);
    service = module.get(HeroService);
  });

  describe('create', () => {
    it('deve criar um novo herói', async () => {
      const dto: HeroDto = {
        nome: 'Bruce Wayne',
        email: 'batman@gotham.com',
        senha: 'batsenha',
        hero: 'Batman',
        projects: [],
      };

      const heroiCriado = { id: 1, ...dto } as unknown as Hero;
      service.create.mockResolvedValue(heroiCriado);

      const resultado = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(resultado).toEqual(heroiCriado);
    });
  });

  describe('findAll', () => {
    it('deve listar heróis com filtros', async () => {
      const filtros = {
        status: 'ATIVO',
        hero: 'Superman',
        email: 'super@krypton.com',
        nome: 'Clark Kent',
        id: 5,
      };

      const herois = [{ ...filtros }] as unknown as Hero[];
      service.findWithFilters.mockResolvedValue(herois);

      const resultado = await controller.findAll(
        filtros.status,
        filtros.hero,
        filtros.email,
        filtros.nome,
        filtros.id,
      );

      expect(service.findWithFilters).toHaveBeenCalledWith(filtros);
      expect(resultado).toEqual(herois);
    });
  });

  describe('findById', () => {
    it('deve retornar um herói pelo ID', async () => {
      const heroi = { id: 10, nome: 'Flash' } as Hero;
      service.findById.mockResolvedValue(heroi);

      const resultado = await controller.findById(10);

      expect(service.findById).toHaveBeenCalledWith(10);
      expect(resultado).toEqual(heroi);
    });
  });

  describe('update', () => {
    it('deve atualizar um herói existente', async () => {
      const dto: UpdateHeroDto = {
        nome: 'Nova Mulher Maravilha',
        email: 'diana@amazonia.com',
      };

      const heroiAtualizado = { id: 3, ...dto } as unknown as Hero;
      service.update.mockResolvedValue(heroiAtualizado);

      const resultado = await controller.update(3, dto);

      expect(service.update).toHaveBeenCalledWith(3, dto);
      expect(resultado).toEqual(heroiAtualizado);
    });
  });

  describe('delete', () => {
    it('deve excluir um herói pelo ID', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete(7);

      expect(service.delete).toHaveBeenCalledWith(7);
    });
  });
});
