import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { GetNpsSummaryUseCase } from '../../../domain/port/in/GetNpsSummaryUseCase';
import { ListNpsResponsesUseCase } from '../../../domain/port/in/ListNpsResponsesUseCase';
import { SubmitNpsScoreUseCase } from '../../../domain/port/in/SubmitNpsScoreUseCase';
import { NpsResponseRepository } from '../../../domain/port/out/NpsResponseRepository';
import {
  getSummarySchema,
  listResponsesSchema,
  submitNpsSchema,
} from './schema/submitNpsSchema';
import { logger } from '../../../utils/logger';

interface SubmitBody {
  score: number;
  comment?: string;
  name?: string;
  page?: string;
}

interface SummaryQuery {
  page?: string;
}

interface ListQuery {
  page?: string;
  limit?: number;
  offset?: number;
}

export function registerNpsRoutes(
  fastify: FastifyInstance,
  submitUseCase: SubmitNpsScoreUseCase,
  summaryUseCase: GetNpsSummaryUseCase,
  listUseCase: ListNpsResponsesUseCase,
  repository: NpsResponseRepository
): void {
  fastify.post<{ Body: SubmitBody }>(
    '/api/v1/nps/responses',
    { schema: submitNpsSchema },
    async (req: FastifyRequest<{ Body: SubmitBody }>, reply: FastifyReply) => {
      try {
        const result = await submitUseCase.execute(req.body);
        return reply.status(201).send(result);
      } catch (err) {
        logger.error('Erro ao registrar resposta NPS', err);
        return reply.status(500).send({
          status: 500,
          error: 'Internal Server Error',
          message: 'Não foi possível registrar a avaliação. Tente novamente.',
        });
      }
    }
  );

  fastify.get<{ Querystring: SummaryQuery }>(
    '/api/v1/nps/summary',
    { schema: getSummarySchema },
    async (req: FastifyRequest<{ Querystring: SummaryQuery }>, reply: FastifyReply) => {
      try {
        const summary = await summaryUseCase.execute(req.query.page);
        return reply.send(summary);
      } catch (err) {
        logger.error('Erro ao buscar resumo NPS', err);
        return reply.status(500).send({
          status: 500,
          error: 'Internal Server Error',
          message: 'Não foi possível calcular o resumo NPS.',
        });
      }
    }
  );

  fastify.get<{ Querystring: ListQuery }>(
    '/api/v1/nps/responses',
    { schema: listResponsesSchema },
    async (req: FastifyRequest<{ Querystring: ListQuery }>, reply: FastifyReply) => {
      try {
        const result = await listUseCase.execute({
          page: req.query.page,
          limit: req.query.limit,
          offset: req.query.offset,
        });
        return reply.send(result);
      } catch (err) {
        logger.error('Erro ao listar respostas NPS', err);
        return reply.status(500).send({
          status: 500,
          error: 'Internal Server Error',
          message: 'Não foi possível listar as avaliações.',
        });
      }
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    '/api/v1/nps/responses/:id',
    async (req, reply) => {
      try {
        await repository.deleteById(req.params.id);
        return reply.status(204).send();
      } catch (err) {
        logger.error('Erro ao apagar resposta NPS', err);
        return reply.status(500).send({
          status: 500,
          error: 'Internal Server Error',
          message: 'Não foi possível apagar a avaliação.',
        });
      }
    }
  );

  fastify.get('/api/v1/health', async (_req, reply) => {
    return reply.send({ status: 'ok', timestamp: new Date().toISOString() });
  });
}
