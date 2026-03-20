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
import { TokenService } from '../services/TokenService';

const SECRET = 'test-secret-key-for-unit-tests';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    service = new TokenService();
  });

  describe('sign', () => {
    it('deve gerar um token JWT verificável com o mesmo secret', () => {
      const token = service.sign({ sub: 'user1', role: 'admin' });
      const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload;
      expect(decoded.sub).toBe('user1');
      expect(decoded.role).toBe('admin');
    });

    it('token deve conter campo exp no futuro', () => {
      const token = service.sign({ sub: 'user1', role: 'user' });
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });

  describe('verify', () => {
    it('deve verificar e retornar o payload de um token válido', () => {
      const token = service.sign({ sub: 'user42', role: 'viewer' });
      const payload = service.verify(token);
      expect(payload.sub).toBe('user42');
      expect(payload.role).toBe('viewer');
    });

    it('deve lançar TokenExpiredError para token expirado', () => {
      const expired = jwt.sign({ sub: 'u1', role: 'user' }, SECRET, { expiresIn: -1 });
      expect(() => service.verify(expired)).toThrow(jwt.TokenExpiredError);
    });

    it('deve lançar JsonWebTokenError para assinatura inválida', () => {
      const tampered = service.sign({ sub: 'u1', role: 'user' }) + 'x';
      expect(() => service.verify(tampered)).toThrow(jwt.JsonWebTokenError);
    });

    it('deve lançar JsonWebTokenError para token completamente malformado', () => {
      expect(() => service.verify('not.a.token')).toThrow(jwt.JsonWebTokenError);
    });
  });

  describe('refresh', () => {
    it('deve gerar novo token com mesmo sub e role', () => {
      const original = service.sign({ sub: 'u1', role: 'admin' });
      const refreshed = service.refresh(original);
      const payload = service.verify(refreshed);
      expect(payload.sub).toBe('u1');
      expect(payload.role).toBe('admin');
    });

    it('token renovado deve ser verificável (ainda válido)', () => {
      const original = service.sign({ sub: 'u1', role: 'admin' });
      const refreshed = service.refresh(original);
      expect(() => service.verify(refreshed)).not.toThrow();
    });
  });

  describe('extractFromHeader', () => {
    it('deve extrair token de header Bearer válido', () => {
      expect(service.extractFromHeader('Bearer some.jwt.token')).toBe('some.jwt.token');
    });

    it('deve retornar null para header undefined', () => {
      expect(service.extractFromHeader(undefined)).toBeNull();
    });

    it('deve retornar null para header sem prefixo Bearer', () => {
      expect(service.extractFromHeader('Basic abc123')).toBeNull();
    });

    it('deve retornar null para string vazia', () => {
      expect(service.extractFromHeader('')).toBeNull();
    });

    it('deve extrair corretamente ignorando espaço após "Bearer "', () => {
      const token = 'eyJ.payload.sig';
      expect(service.extractFromHeader(`Bearer ${token}`)).toBe(token);
    });
  });
});
