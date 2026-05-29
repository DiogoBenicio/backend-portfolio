import { NpsResponse, isValidScore } from "../model/NpsResponse";
import {
  SubmitNpsScoreInput,
  SubmitNpsScoreUseCase,
} from "../port/in/SubmitNpsScoreUseCase";
import { NpsResponseRepository } from "../port/out/NpsResponseRepository";

export class SubmitNpsScoreService implements SubmitNpsScoreUseCase {
  constructor(private readonly repository: NpsResponseRepository) {}

  async execute(input: SubmitNpsScoreInput): Promise<NpsResponse> {
    if (!isValidScore(input.score)) {
      const err = new Error("Score inválido: deve ser um inteiro entre 0 e 10");
      Object.assign(err, { statusCode: 422 });
      throw err;
    }

    return this.repository.create({
      score: input.score,
      comment: input.comment?.trim() || undefined,
      name: input.name?.trim() || undefined,
      page: (input.page && input.page.trim()) || "portfolio",
    });
  }
}
