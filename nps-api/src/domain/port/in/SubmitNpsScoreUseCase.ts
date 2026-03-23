import { NpsResponse } from '../../model/NpsResponse';

export interface SubmitNpsScoreInput {
  score: number;
  comment?: string;
  name?: string;
  page?: string;
}

export interface SubmitNpsScoreUseCase {
  execute(input: SubmitNpsScoreInput): Promise<NpsResponse>;
}
