import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListNpsResponsesService } from '../domain/service/ListNpsResponsesService';
import { NpsResponseRepository } from '../domain/port/out/NpsResponseRepository';
import { NpsResponse } from '../domain/model/NpsResponse';

const makeResponse = (score: number, id: string): NpsResponse => ({
  id,
  score,
  comment: null,
  page: 'portfolio',
  createdAt: new Date(),
});

describe('ListNpsResponsesService', () => {
  let repository: NpsResponseRepository;
  let service: ListNpsResponsesService;

  beforeEach(() => {
    repository = {
      create: vi.fn(),
      findMany: vi.fn(),
      findAllByPage: vi.fn(),
    };
    service = new ListNpsResponsesService(repository);
  });

  it('deve usar limit=10 e offset=0 como defaults', async () => {
    vi.mocked(repository.findMany).mockResolvedValue({ data: [], total: 0 });
    await service.execute({});
    expect(repository.findMany).toHaveBeenCalledWith({ page: undefined, limit: 10, offset: 0 });
  });

  it('deve repassar limit e offset informados', async () => {
    vi.mocked(repository.findMany).mockResolvedValue({ data: [], total: 0 });
    await service.execute({ limit: 5, offset: 10 });
    expect(repository.findMany).toHaveBeenCalledWith({ page: undefined, limit: 5, offset: 10 });
  });

  it('deve repassar filtro de page quando informado', async () => {
    vi.mocked(repository.findMany).mockResolvedValue({ data: [], total: 0 });
    await service.execute({ page: 'portfolio' });
    expect(repository.findMany).toHaveBeenCalledWith({ page: 'portfolio', limit: 10, offset: 0 });
  });

  it('deve retornar data, total, limit e offset no resultado', async () => {
    const data = [makeResponse(9, '1'), makeResponse(7, '2')];
    vi.mocked(repository.findMany).mockResolvedValue({ data, total: 2 });

    const result = await service.execute({ limit: 5, offset: 0 });

    expect(result.data).toEqual(data);
    expect(result.total).toBe(2);
    expect(result.limit).toBe(5);
    expect(result.offset).toBe(0);
  });
});
