import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetNpsSummaryService } from '../domain/service/GetNpsSummaryService';
import { NpsResponseRepository } from '../domain/port/out/NpsResponseRepository';
import { NpsResponse } from '../domain/model/NpsResponse';

const makeResponse = (score: number, id = '1'): NpsResponse => ({
  id,
  score,
  comment: null,
  page: 'portfolio',
  createdAt: new Date(),
});

describe('GetNpsSummaryService', () => {
  let repository: NpsResponseRepository;
  let service: GetNpsSummaryService;

  beforeEach(() => {
    repository = {
      create: vi.fn(),
      findMany: vi.fn(),
      findAllByPage: vi.fn(),
    };
    service = new GetNpsSummaryService(repository);
  });

  it('deve calcular NPS corretamente com promotores e detratores', async () => {
    vi.mocked(repository.findAllByPage).mockResolvedValue([
      makeResponse(10, '1'),
      makeResponse(9, '2'),
      makeResponse(7, '3'),
      makeResponse(6, '4'),
      makeResponse(0, '5'),
    ]);

    const summary = await service.execute('portfolio');

    expect(summary.promoters).toBe(2);
    expect(summary.passives).toBe(1);
    expect(summary.detractors).toBe(2);
    expect(summary.totalResponses).toBe(5);
    // NPS = ((2-2)/5) * 100 = 0
    expect(summary.npsScore).toBe(0);
    expect(summary.zone).toBe('Crítico');
  });

  it('deve retornar NPS 100 com todos promotores', async () => {
    vi.mocked(repository.findAllByPage).mockResolvedValue([
      makeResponse(10, '1'),
      makeResponse(9, '2'),
      makeResponse(10, '3'),
    ]);

    const summary = await service.execute();

    expect(summary.npsScore).toBe(100);
    expect(summary.zone).toBe('Excelência');
  });

  it('deve retornar sumário vazio quando sem respostas', async () => {
    vi.mocked(repository.findAllByPage).mockResolvedValue([]);

    const summary = await service.execute();

    expect(summary.totalResponses).toBe(0);
    expect(summary.npsScore).toBe(0);
  });

  it('deve classificar zona como Qualidade para NPS entre 51 e 75', async () => {
    vi.mocked(repository.findAllByPage).mockResolvedValue([
      makeResponse(10, '1'),
      makeResponse(10, '2'),
      makeResponse(9, '3'),
      makeResponse(7, '4'),
    ]);

    const summary = await service.execute();

    // Promoters=3, Detractors=0, Total=4 → NPS = 75
    expect(summary.npsScore).toBe(75);
    expect(summary.zone).toBe('Qualidade');
  });
});
