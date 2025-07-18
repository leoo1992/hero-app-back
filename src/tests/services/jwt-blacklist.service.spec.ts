import { JwtBlacklistService } from 'src/services/jwt-blacklist.service';

describe('JwtBlacklistService', () => {
  let service: JwtBlacklistService;

  beforeEach(() => {
    service = new JwtBlacklistService();
  });

  it('deve adicionar um token à blacklist', async () => {
    const token = 'token-teste';
    await service.add(token);
    const existe = await service.has(token);
    expect(existe).toBe(true);
  });

  it('deve verificar se um token está na blacklist com has()', async () => {
    const token = 'token-existente';
    await service.add(token);
    const resultado = await service.has(token);
    expect(resultado).toBe(true);

    const tokenNaoExistente = 'token-nao-existe';
    const resultado2 = await service.has(tokenNaoExistente);
    expect(resultado2).toBe(false);
  });

  it('deve verificar se um token está na blacklist com isBlacklisted()', async () => {
    const token = 'token-blacklist';
    await service.add(token);
    const resultado = await service.isBlacklisted(token);
    expect(resultado).toBe(true);

    const tokenNaoExistente = 'token-livre';
    const resultado2 = await service.isBlacklisted(tokenNaoExistente);
    expect(resultado2).toBe(false);
  });
});
