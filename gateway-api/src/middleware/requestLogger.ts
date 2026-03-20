import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { logger } from '../utils/logger';

export function registerRequestLogger(server: FastifyInstance): void {
  server.addHook('onResponse', (request: FastifyRequest, reply: FastifyReply, done) => {
    const { method, url } = request;
    const status = reply.statusCode;
    const ms = reply.elapsedTime;
    const ip = request.ip;

    logger.access(method, url, status, ms, ip);

    done();
  });
}
