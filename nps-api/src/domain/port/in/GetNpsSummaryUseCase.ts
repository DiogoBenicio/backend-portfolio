import { NpsSummary } from '../../model/NpsSummary';

export interface GetNpsSummaryUseCase {
  execute(page?: string): Promise<NpsSummary>;
}
