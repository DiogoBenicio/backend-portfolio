import { ListNpsResponsesInput, ListNpsResponsesResult, ListNpsResponsesUseCase } from '../port/in/ListNpsResponsesUseCase';
import { NpsResponseRepository } from '../port/out/NpsResponseRepository';

export class ListNpsResponsesService implements ListNpsResponsesUseCase {
  constructor(private readonly repository: NpsResponseRepository) {}

  async execute(input: ListNpsResponsesInput): Promise<ListNpsResponsesResult> {
    const limit = input.limit ?? 10;
    const offset = input.offset ?? 0;

    const { data, total } = await this.repository.findMany({
      page: input.page,
      limit,
      offset,
    });

    return { data, total, limit, offset };
  }
}
