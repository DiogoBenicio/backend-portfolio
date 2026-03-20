import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export async function buildServer(): Promise<FastifyInstance> {
  const server = fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // CORS restrito: apenas o API Gateway (interno) acessa esta API diretamente.
  // Em produção, o Nginx é o único ponto de entrada externo.
  await server.register(cors, {
    origin: [
      process.env.CORS_ORIGIN ?? 'http://gateway-api:4000',
      'http://localhost:3001', // desenvolvimento local
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Forwarded-For'],
  });

  await server.register(swagger, {
    openapi: {
      info: {
        title: 'NPS API',
        description: 'API de avaliação NPS — Arquitetura Hexagonal com Fastify + TypeScript + PostgreSQL',
        version: '1.0.0',
        contact: {
          name: 'Diogo Silveira Benício',
          email: 'diogobenicio@hotmail.com',
          url: 'https://linkedin.com/in/diogosbenicio',
        },
      },
      tags: [
        { name: 'NPS', description: 'Operações NPS' },
        { name: 'Health', description: 'Health check' },
      ],
    },
  });

  await server.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
    },
  });

  server.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode ?? 500;

    // Erros de validação do Fastify → 422
    if (error.validation || error.code === 'FST_ERR_VALIDATION') {
      return reply.status(422).send({
        status: 422,
        error: 'Unprocessable Entity',
        message: error.message,
      });
    }

    if (statusCode >= 500) {
      server.log.error({ err: error, method: request.method, url: request.url }, error.message);
    } else {
      server.log.warn({ statusCode, url: request.url }, error.message);
    }

    return reply.status(statusCode).send({
      status: statusCode,
      error: error.name,
      message: error.message,
    });
  });

  return server;
}
