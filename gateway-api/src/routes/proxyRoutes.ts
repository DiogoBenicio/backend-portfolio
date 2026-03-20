import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { proxyService } from '../services/ProxyService';
import { resolveUpstream } from '../config/routeConfig';
import { logger } from '../utils/logger';

export function registerProxyRoutes(server: FastifyInstance): void {
  // Captura todas as rotas /api/weather/* e /api/nps/*
  for (const prefix of ['/api/weather', '/api/nps']) {
    server.all(
      `${prefix}/*`,
      async (request: FastifyRequest, reply: FastifyReply) => {
        const resolved = resolveUpstream(request.url.split('?')[0]);

        if (!resolved) {
          return reply.status(404).send({
            status: 404,
            error: 'Not Found',
            message: `Rota não encontrada: ${request.method} ${request.url}`,
          });
        }

        // Extrai query string
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

          // Repassa headers do upstream
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
    );
  }
}
