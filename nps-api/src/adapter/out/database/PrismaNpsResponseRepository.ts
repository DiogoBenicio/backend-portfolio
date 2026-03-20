import { PrismaClient } from '@prisma/client';
import { NpsResponse } from '../../../domain/model/NpsResponse';
import {
  CreateNpsResponseInput,
  FindManyOptions,
  NpsResponseRepository,
} from '../../../domain/port/out/NpsResponseRepository';

export class PrismaNpsResponseRepository implements NpsResponseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateNpsResponseInput): Promise<NpsResponse> {
    return this.prisma.npsResponse.create({
      data: {
        score: input.score,
        comment: input.comment,
        page: input.page,
      },
    });
  }

  async findMany(options: FindManyOptions): Promise<{ data: NpsResponse[]; total: number }> {
    const where = options.page ? { page: options.page } : {};

    const [data, total] = await Promise.all([
      this.prisma.npsResponse.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options.limit,
        skip: options.offset,
      }),
      this.prisma.npsResponse.count({ where }),
    ]);

    return { data, total };
  }

  async findAllByPage(page?: string): Promise<NpsResponse[]> {
    const where = page ? { page } : {};
    return this.prisma.npsResponse.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}
