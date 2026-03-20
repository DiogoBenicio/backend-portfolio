import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubmitNpsScoreService } from '../domain/service/SubmitNpsScoreService';
import { NpsResponseRepository } from '../domain/port/out/NpsResponseRepository';

describe('SubmitNpsScoreService', () => {
  let repository: NpsResponseRepository;
  let service: SubmitNpsScoreService;

  beforeEach(() => {
    repository = {
      create: vi.fn(),
      findMany: vi.fn(),
      findAllByPage: vi.fn(),
    };
    service = new SubmitNpsScoreService(repository);
  });

  it('deve criar resposta NPS com score válido', async () => {
    const created = {
      id: 'abc123',
      score: 9,
      comment: 'Ótimo portfólio!',
      page: 'portfolio',
      createdAt: new Date(),
    };
    vi.mocked(repository.create).mockResolvedValue(created);

    const result = await service.execute({ score: 9, comment: 'Ótimo portfólio!' });

    expect(result).toEqual(created);
    expect(repository.create).toHaveBeenCalledWith({
      score: 9,
      comment: 'Ótimo portfólio!',
      page: 'portfolio',
    });
  });

  it('deve lançar erro para score inválido (> 10)', async () => {
    await expect(service.execute({ score: 11 })).rejects.toThrow('Score inválido');
  });

  it('deve lançar erro para score inválido (< 0)', async () => {
    await expect(service.execute({ score: -1 })).rejects.toThrow('Score inválido');
  });

  it('deve usar page padrão "portfolio" quando não informado', async () => {
    vi.mocked(repository.create).mockResolvedValue({
      id: '1', score: 8, comment: null, page: 'portfolio', createdAt: new Date(),
    });

    await service.execute({ score: 8 });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ page: 'portfolio' })
    );
  });
});
