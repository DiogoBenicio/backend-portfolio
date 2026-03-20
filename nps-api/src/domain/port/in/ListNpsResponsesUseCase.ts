import { NpsResponse } from '../../model/NpsResponse';

export interface ListNpsResponsesInput {
  page?: string;
  limit?: number;
  offset?: number;
}

export interface ListNpsResponsesResult {
  data: NpsResponse[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListNpsResponsesUseCase {
  execute(input: ListNpsResponsesInput): Promise<ListNpsResponsesResult>;
}
