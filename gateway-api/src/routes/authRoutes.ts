import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { tokenService } from '../services/TokenService';
import { env } from '../config/env';

interface LoginBody {
  username: string;
  password: string;
}

const loginSchema = {
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string' },
      password: { type: 'string' },
    },
  },
};

export function registerAuthRoutes(server: FastifyInstance): void {
  server.post<{ Body: LoginBody }>(
    '/api/auth/login',
    { schema: loginSchema },
    async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
      const { username, password } = request.body;

      if (username !== env.adminUser || password !== env.adminPass) {
        return reply.status(401).send({
          status: 401,
          error: 'Unauthorized',
          message: 'Credenciais inválidas',
        });
      }

      const token = tokenService.sign({ sub: username, role: 'admin' });

      return reply.status(200).send({
        token,
        tokenType: 'Bearer',
        expiresIn: env.jwtExpiresIn,
      });
    }
  );

  server.post(
    '/api/auth/refresh',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const token = tokenService.extractFromHeader(request.headers.authorization);
      if (!token) {
        return reply.status(401).send({
          status: 401,
          error: 'Unauthorized',
          message: 'Token não fornecido',
        });
      }

      try {
        const newToken = tokenService.refresh(token);
        return reply.status(200).send({
          token: newToken,
          tokenType: 'Bearer',
          expiresIn: env.jwtExpiresIn,
        });
      } catch {
        return reply.status(401).send({
          status: 401,
          error: 'Unauthorized',
          message: 'Token inválido ou expirado',
        });
      }
    }
  );
}
