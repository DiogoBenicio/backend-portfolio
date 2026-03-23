import { PrismaClient } from '@prisma/client';
import { GetNpsSummaryService } from './domain/service/GetNpsSummaryService';
import { ListNpsResponsesService } from './domain/service/ListNpsResponsesService';
import { SubmitNpsScoreService } from './domain/service/SubmitNpsScoreService';
import { PrismaNpsResponseRepository } from './adapter/out/database/PrismaNpsResponseRepository';
import { registerNpsRoutes } from './adapter/in/http/NpsController';
import { buildServer } from './server';
import { logger, printBanner } from './utils/logger';

async function main() {
  // Handlers globais de erros não capturados
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection:', reason);
    process.exit(1);
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });

  printBanner();

  const prisma = new PrismaClient();

  // Conecta ao banco antes de subir o servidor
  try {
    await prisma.$connect();
    logger.info('Conexão com PostgreSQL estabelecida');
  } catch (err) {
    logger.error('Falha ao conectar com PostgreSQL', err);
    process.exit(1);
  }

  // Wiring da arquitetura hexagonal
  const repository = new PrismaNpsResponseRepository(prisma);
  const submitUseCase = new SubmitNpsScoreService(repository);
  const summaryUseCase = new GetNpsSummaryService(repository);
  const listUseCase = new ListNpsResponsesService(repository);

  const server = await buildServer();
  registerNpsRoutes(server, submitUseCase, summaryUseCase, listUseCase, repository);

  const port = Number(process.env.PORT ?? 3001);
  const host = '0.0.0.0';

  try {
    await server.listen({ port, host });
    logger.info(`NPS-API rodando em http://${host}:${port}`);
    logger.info(`Documentação disponível em http://${host}:${port}/documentation`);
  } catch (err) {
    logger.error('Falha ao iniciar servidor', err);
    await prisma.$disconnect();
    process.exit(1);
  }

  const shutdown = async () => {
    logger.info('Encerrando NPS-API...');
    await server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main();
