jest.mock('../config/env', () => ({
  env: {
    jwtSecret: 'test-secret-key-for-unit-tests',
    jwtExpiresIn: '2h',
    port: 4000,
    weatherApiUrl: 'http://weather-api:8080',
    npsApiUrl: 'http://nps-api:3001',
  },
}));

import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/authMiddleware';
import { tokenService } from '../services/TokenService';

const SECRET = 'test-secret-key-for-unit-tests';

function makeRequest(method: string, url: string, authorization?: string) {
  return { method, url, ip: '127.0.0.1', headers: { authorization } } as never;
}

function makeReply() {
  return {
    _status: 0,
    _body: undefined as unknown,
    status(code: number) { this._status = code; return this; },
    send(body: unknown) { this._body = body; return this; },
  };
}

describe('authMiddleware', () => {
  describe('rotas de saúde', () => {
    it.each(['/health', '/api/health', '/api/v1/health'])(
      '%s deve passar sem verificar token',
      async (url) => {
        const reply = makeReply();
        await authMiddleware(makeRequest('GET', url), reply as never);
        expect(reply._status).toBe(0);
      }
    );
  });

  describe('rotas públicas', () => {
    it.each([
      ['GET', '/api/weather/current'],
      ['GET', '/api/weather/forecast'],
      ['POST', '/api/nps/responses'],
      ['GET', '/api/nps/summary'],
      ['POST', '/api/auth/login'],
    ])('%s %s deve passar sem token', async (method, url) => {
      const reply = makeReply();
      await authMiddleware(makeRequest(method, url), reply as never);
      expect(reply._status).toBe(0);
    });
  });

  describe('rotas protegidas sem token', () => {
    it('deve retornar 401 quando Authorization ausente', async () => {
      const reply = makeReply();
      await authMiddleware(makeRequest('GET', '/api/weather/history'), reply as never);
      expect(reply._status).toBe(401);
      expect((reply._body as { error: string }).error).toBe('Unauthorized');
    });

    it('deve retornar 401 com header de formato inválido (Basic)', async () => {
      const reply = makeReply();
      await authMiddleware(makeRequest('GET', '/api/weather/history', 'Basic abc'), reply as never);
      expect(reply._status).toBe(401);
    });
  });

  describe('rotas protegidas com token válido', () => {
    it('deve injetar user no request e não retornar erro', async () => {
      const token = tokenService.sign({ sub: 'admin', role: 'admin' });
      const req = makeRequest('POST', '/api/weather/refresh', `Bearer ${token}`);
      const reply = makeReply();
      await authMiddleware(req as never, reply as never);
      expect(reply._status).toBe(0);
      expect((req as unknown as { user: { sub: string } }).user.sub).toBe('admin');
    });
  });

  describe('token inválido ou expirado', () => {
    it('deve retornar 401 com error "Token Expired" para token expirado', async () => {
      const expired = jwt.sign({ sub: 'u1', role: 'user' }, SECRET, { expiresIn: -1 });
      const reply = makeReply();
      await authMiddleware(makeRequest('GET', '/api/weather/history', `Bearer ${expired}`), reply as never);
      expect(reply._status).toBe(401);
      expect((reply._body as { error: string }).error).toBe('Token Expired');
    });

    it('deve retornar 401 com error "Invalid Token" para token malformado', async () => {
      const reply = makeReply();
      await authMiddleware(makeRequest('GET', '/api/weather/history', 'Bearer not.valid.token'), reply as never);
      expect(reply._status).toBe(401);
      expect((reply._body as { error: string }).error).toBe('Invalid Token');
    });

    it('deve retornar 401 com error "Invalid Token" para assinatura adulterada', async () => {
      const tampered = tokenService.sign({ sub: 'u1', role: 'user' }) + 'x';
      const reply = makeReply();
      await authMiddleware(makeRequest('GET', '/api/weather/history', `Bearer ${tampered}`), reply as never);
      expect(reply._status).toBe(401);
      expect((reply._body as { error: string }).error).toBe('Invalid Token');
    });
  });
});
