import {
  NpsSummary,
  calculateNps,
  classifyScore,
  getZone,
} from '../model/NpsSummary';
import { GetNpsSummaryUseCase } from '../port/in/GetNpsSummaryUseCase';
import { NpsResponseRepository } from '../port/out/NpsResponseRepository';

export class GetNpsSummaryService implements GetNpsSummaryUseCase {
  constructor(private readonly repository: NpsResponseRepository) {}

  async execute(page?: string): Promise<NpsSummary> {
    const responses = await this.repository.findAllByPage(page);

    const distribution: Record<number, number> = {};
    for (let i = 0; i <= 10; i++) distribution[i] = 0;

    let promoters = 0;
    let passives = 0;
    let detractors = 0;

    for (const r of responses) {
      distribution[r.score] = (distribution[r.score] ?? 0) + 1;

      const category = classifyScore(r.score);
      if (category === 'promoter') promoters++;
      else if (category === 'passive') passives++;
      else detractors++;
    }

    const total = responses.length;
    const npsScore = calculateNps(promoters, detractors, total);
    const zone = getZone(npsScore);

    return {
      page: page ?? 'portfolio',
      totalResponses: total,
      npsScore,
      zone,
      promoters,
      passives,
      detractors,
      distribution,
    };
  }
}
