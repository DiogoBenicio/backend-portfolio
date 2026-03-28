import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { proxyService } from '../services/ProxyService';
import { resolveUpstream } from '../config/routeConfig';
import { logger } from '../utils/logger';

// Handler compartilhado de proxy — encaminha para o upstream correto
async function proxyHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const resolved = resolveUpstream(request.url.split('?')[0]);

  if (!resolved) {
    return reply.status(404).send({
      status: 404,
      error: 'Not Found',
      message: `Rota não encontrada: ${request.method} ${request.url}`,
    });
  }

  const query = request.query as Record<string, string | string[] | undefined>;

  try {
    const result = await proxyService.forward({
      baseUrl: resolved.baseUrl,
      path: resolved.rewrittenPath,
      method: request.method,
      headers: request.headers as Record<string, string | string[] | undefined>,
      query,
      body: request.body,
      clientIp: request.ip,
    });

    for (const [key, value] of Object.entries(result.headers)) {
      reply.header(key, value);
    }

    return reply.status(result.status).send(result.data);
  } catch (err) {
    logger.error(
      `Proxy: falha ao encaminhar  [${request.method} ${request.url}]  upstream=${resolved.baseUrl}`,
      err,
    );
    return reply.status(502).send({
      status: 502,
      error: 'Bad Gateway',
      message: 'Falha ao comunicar com o serviço de destino. Tente novamente em instantes.',
    });
  }
}

// Rate limit generoso para NPS — não pode bloquear quem quer deixar feedback
const NPS_RATE_LIMIT = {
  config: {
    rateLimit: {
      max: 300,
      timeWindow: '1 minute',
      errorResponseBuilder: (_req: unknown, context: { after: string; ttl: number }) => ({
        status: 429,
        error: 'Too Many Requests',
        message: 'Muitas requisições. Aguarde antes de tentar novamente.',
        retryAfter: context.after,
        retryAfterMs: context.ttl,
      }),
    },
  },
};

// Limite ainda mais restrito para rotas de consulta pesada (demo)
const HEAVY_RATE_LIMIT = {
  config: {
    rateLimit: {
      max: 30,
      timeWindow: '1 minute',
      errorResponseBuilder: (_req: unknown, context: { after: string; ttl: number }) => ({
        status: 429,
        error: 'Too Many Requests',
        message: 'Muitas requisições. Aguarde antes de tentar novamente.',
        retryAfter: context.after,
        retryAfterMs: context.ttl,
      }),
    },
  },
};

export function registerProxyRoutes(server: FastifyInstance): void {
  // Rotas sensíveis com rate limit próprio (3 req/min)
  server.get('/api/weather/sensors',  HEAVY_RATE_LIMIT, proxyHandler);
  server.get('/api/weather/calendar', HEAVY_RATE_LIMIT, proxyHandler);
  server.post('/api/weather/populate', HEAVY_RATE_LIMIT, proxyHandler);

  // NPS com rate limit próprio generoso (deve funcionar mesmo após rate limit do restante)
  server.all('/api/nps/*', NPS_RATE_LIMIT, proxyHandler);

  // Captura todas as rotas restantes de /api/weather/*
  server.all(
    '/api/weather/*',
    async (request: FastifyRequest, reply: FastifyReply) => {
      return proxyHandler(request, reply);
    }
  );
}
