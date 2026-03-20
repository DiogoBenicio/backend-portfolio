import { NpsResponse } from '../../model/NpsResponse';

export interface CreateNpsResponseInput {
  score: number;
  comment?: string;
  page: string;
}

export interface FindManyOptions {
  page?: string;
  limit: number;
  offset: number;
}

export interface NpsResponseRepository {
  create(input: CreateNpsResponseInput): Promise<NpsResponse>;
  findMany(options: FindManyOptions): Promise<{ data: NpsResponse[]; total: number }>;
  findAllByPage(page?: string): Promise<NpsResponse[]>;
}
