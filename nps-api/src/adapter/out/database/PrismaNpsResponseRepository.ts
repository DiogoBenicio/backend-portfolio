import { PrismaClient, Prisma } from "@prisma/client";
import { NpsResponse } from "../../../domain/model/NpsResponse";
import {
  CreateNpsResponseInput,
  FindManyOptions,
  NpsResponseRepository,
} from "../../../domain/port/out/NpsResponseRepository";

export class PrismaNpsResponseRepository implements NpsResponseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateNpsResponseInput): Promise<NpsResponse> {
    try {
      const record = await this.prisma.npsResponse.create({
        data: {
          score: input.score,
          comment: input.comment,
          name: input.name,
          page: input.page,
        },
      });
      return record;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw Object.assign(new Error("Erro ao salvar avaliação"), {
          statusCode: 500,
        });
      }
      throw Object.assign(new Error("Erro interno"), { statusCode: 500 });
    }
  }

  async findMany(
    options: FindManyOptions,
  ): Promise<{ data: NpsResponse[]; total: number }> {
    const where = options.page ? { page: options.page } : {};

    const [data, total] = await Promise.all([
      this.prisma.npsResponse.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: options.limit,
        skip: options.offset,
      }),
      this.prisma.npsResponse.count({ where }),
    ]);

    return { data, total };
  }

  async findAllByPage(page?: string): Promise<NpsResponse[]> {
    const MAX = 10_000;
    const where = page ? { page } : {};
    const results = await this.prisma.npsResponse.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: MAX,
    });
    if (results.length === MAX) {
      console.warn(
        `[NPS] findAllByPage truncado em ${MAX} registros para page="${page}"`,
      );
    }
    return results;
  }

  async deleteById(id: string): Promise<void> {
    try {
      await this.prisma.npsResponse.delete({ where: { id } });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        const notFound = new Error(`Resposta NPS não encontrada: ${id}`);
        (notFound as Error & { statusCode: number }).statusCode = 404;
        throw notFound;
      } else if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2023"
      ) {
        throw Object.assign(new Error("ID inválido"), { statusCode: 422 });
      }
      throw Object.assign(new Error("Erro interno do banco de dados"), {
        statusCode: 500,
      });
    }
  }
}
