import fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env';
import { authMiddleware } from './middleware/authMiddleware';
import { registerRequestLogger } from './middleware/requestLogger';
import { registerAuthRoutes } from './routes/authRoutes';
import { registerProxyRoutes } from './routes/proxyRoutes';
import { logger, printBanner } from './utils/logger';

async function buildServer() {
  const server = fastify({
    logger: false, // log próprio via utils/logger
    trustProxy: true, // confiar no X-Forwarded-For do Nginx
  });

  // ── Plugins ────────────────────────────────────────────────
  await server.register(cors, {
    // Gateway aceita apenas origens internas (Nginx repassa)
    origin: ['http://localhost', 'http://nginx', 'http://portfolio-frontend:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await server.register(rateLimit, {
    global: true,
    max: 200,      // 200 req/min por IP
    timeWindow: '1 minute',
    keyGenerator: (request) => request.ip,
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
    errorResponseBuilder: (_req, context) => ({
      status: 429,
      error: 'Too Many Requests',
      message: 'Muitas requisições. Aguarde antes de tentar novamente.',
      retryAfter: context.after,
      retryAfterMs: context.ttl,
    }),
  });

  // ── Middleware global ───────────────────────────────────────
  registerRequestLogger(server);

  // Hook de autenticação — executado em TODAS as rotas
  server.addHook('onRequest', authMiddleware);

  // ── Health check (público, sem auth) ───────────────────────
  server.get('/health', async () => ({
    status: 'ok',
    service: 'gateway-api',
    timestamp: new Date().toISOString(),
  }));

  server.get('/api/v1/health', async () => {
    const npsOk = await fetch(`${env.npsApiUrl}/api/v1/health`).then((r) => r.ok).catch(() => false);
    return {
      status: 'ok',
      service: 'gateway-api',
      timestamp: new Date().toISOString(),
      upstream: {
        nps: npsOk ? 'ok' : 'down',
      },
    };
  });

  // ── Rotas ──────────────────────────────────────────────────
  registerAuthRoutes(server);
  registerProxyRoutes(server);

  // ── Error handler ──────────────────────────────────────────
  server.setErrorHandler((error, request, reply) => {
    const err = error as { statusCode?: number; code?: string; validation?: unknown; message?: string; name?: string; stack?: string };
    const status = err.statusCode ?? 500;

    // Erros de validação do Fastify (400)
    if (err.code === 'FST_ERR_VALIDATION' || err.validation) {
      logger.warn(`Validação falhou: ${err.message ?? 'erro desconhecido'}  [${request.method} ${request.url}]`);
      return reply.status(422).send({
        status: 422,
        error: 'Unprocessable Entity',
        message: err.message ?? 'Erro de validação',
      });
    }

    if (status >= 500) {
      logger.error(`Erro interno: ${err.message ?? 'erro desconhecido'}`, {
        method: request.method,
        url: request.url,
        ip: request.ip,
        stack: err.stack,
      });
    } else {
      logger.warn(`Erro ${status}: ${err.message ?? 'erro desconhecido'}  [${request.method} ${request.url}]`);
    }

    return reply.status(status).send({
      status,
      error: err.name ?? 'Error',
      message: err.message ?? 'Erro interno',
    });
  });

  // Rota não encontrada
  server.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      status: 404,
      error: 'Not Found',
      message: 'Endpoint não encontrado neste gateway',
    });
  });

  return server;
}

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

  const server = await buildServer();

  try {
    await server.listen({ port: env.port, host: '0.0.0.0' });
    logger.info(`Gateway-API rodando em http://0.0.0.0:${env.port}`);
    logger.info(`Upstream Weather → ${process.env.WEATHER_API_URL}`);
    logger.info(`Upstream NPS    → ${process.env.NPS_API_URL}`);
  } catch (err) {
    const unknownErr = err as Error | string | null | undefined;
    logger.error('Falha ao iniciar servidor', unknownErr instanceof Error ? unknownErr : new Error(String(unknownErr)));
    process.exit(1);
  }

  const shutdown = async () => {
    logger.info('Encerrando Gateway-API...');
    await server.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main();
