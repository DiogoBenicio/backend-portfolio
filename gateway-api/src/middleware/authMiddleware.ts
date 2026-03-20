import { FastifyRequest, FastifyReply } from 'fastify';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { tokenService } from '../services/TokenService';
import { isPublicRoute } from '../config/routeConfig';
import { logger } from '../utils/logger';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const { method, url } = request;

  // Rotas de saúde nunca exigem auth
  if (url === '/health' || url === '/api/health' || url === '/api/v1/health') return;

  // Verifica se é rota pública
  if (isPublicRoute(method, url)) return;

  // Extrai token do header Authorization
  const token = tokenService.extractFromHeader(request.headers.authorization);

  if (!token) {
    logger.warn(`Auth: token ausente  [${method} ${url}]  ip=${request.ip}`);
    return reply.status(401).send({
      status: 401,
      error: 'Unauthorized',
      message: 'Token de autenticação não fornecido. Use: Authorization: Bearer <token>',
    });
  }

  try {
    const payload = tokenService.verify(token);
    // Injeta o payload no request para uso nas rotas
    (request as FastifyRequest & { user: unknown }).user = payload;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      logger.warn(`Auth: token expirado  [${method} ${url}]  ip=${request.ip}`);
      return reply.status(401).send({
        status: 401,
        error: 'Token Expired',
        message: 'Token expirado. Faça login novamente ou use /api/auth/refresh',
      });
    }
    if (err instanceof JsonWebTokenError) {
      logger.warn(`Auth: token inválido  [${method} ${url}]  ip=${request.ip}  reason=${(err as Error).message}`);
      return reply.status(401).send({
        status: 401,
        error: 'Invalid Token',
        message: 'Token inválido ou mal-formado',
      });
    }
    logger.error(`Auth: erro inesperado  [${method} ${url}]  ip=${request.ip}`, err);
    throw err;
  }
}
