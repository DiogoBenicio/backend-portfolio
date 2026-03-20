jest.mock('../config/env', () => ({
  env: {
    jwtSecret: 'test-secret',
    jwtExpiresIn: '2h',
    port: 4000,
    weatherApiUrl: 'http://weather-api:8080',
    npsApiUrl: 'http://nps-api:3001',
  },
}));

import axios, { AxiosError } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ProxyService } from '../services/ProxyService';

const mock = new MockAdapter(axios);

afterEach(() => mock.reset());

describe('ProxyService', () => {
  let service: ProxyService;

  beforeEach(() => {
    service = new ProxyService();
  });

  const baseReq = {
    baseUrl: 'http://weather-api:8080',
    path: '/api/v1/weather/current',
    method: 'GET',
    headers: {} as Record<string, string>,
    clientIp: '10.0.0.1',
  };

  describe('forward — sucesso', () => {
    it('deve retornar status e data do upstream', async () => {
      mock.onGet('http://weather-api:8080/api/v1/weather/current').reply(200, { city: 'São Paulo' });
      const result = await service.forward(baseReq);
      expect(result.status).toBe(200);
      expect(result.data).toEqual({ city: 'São Paulo' });
    });

    it('deve incluir x-forwarded-by: api-gateway nos headers da requisição', async () => {
      let headers: Record<string, string> = {};
      mock.onGet('http://weather-api:8080/api/v1/weather/current').reply((config) => {
        headers = config.headers as Record<string, string>;
        return [200, {}];
      });
      await service.forward(baseReq);
      expect(headers['x-forwarded-by']).toBe('api-gateway');
    });

    it('deve incluir x-forwarded-for com o IP do cliente', async () => {
      let headers: Record<string, string> = {};
      mock.onGet('http://weather-api:8080/api/v1/weather/current').reply((config) => {
        headers = config.headers as Record<string, string>;
        return [200, {}];
      });
      await service.forward({ ...baseReq, clientIp: '192.168.1.99' });
      expect(headers['x-forwarded-for']).toBe('192.168.1.99');
    });

    it('deve usar "unknown" como x-forwarded-for quando clientIp ausente', async () => {
      let headers: Record<string, string> = {};
      mock.onGet('http://weather-api:8080/api/v1/weather/current').reply((config) => {
        headers = config.headers as Record<string, string>;
        return [200, {}];
      });
      await service.forward({ ...baseReq, clientIp: undefined });
      expect(headers['x-forwarded-for']).toBe('unknown');
    });

    it('deve incluir x-request-id único a cada chamada', async () => {
      const ids: string[] = [];
      mock.onGet('http://weather-api:8080/api/v1/weather/current').reply((config) => {
        ids.push((config.headers as Record<string, string>)['x-request-id']);
        return [200, {}];
      });
      await service.forward(baseReq);
      await service.forward(baseReq);
      expect(ids[0]).not.toBe(ids[1]);
      expect(ids[0]).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('deve retornar status 404 sem lançar erro', async () => {
      mock.onGet('http://weather-api:8080/api/v1/weather/current').reply(404, { message: 'not found' });
      const result = await service.forward(baseReq);
      expect(result.status).toBe(404);
    });
  });

  describe('forward — erros de rede', () => {
    it('deve retornar 503 quando upstream recusa conexão (ECONNREFUSED)', async () => {
      mock.onGet('http://weather-api:8080/api/v1/weather/current').replyOnce(() => {
        const err = Object.assign(new Error('ECONNREFUSED'), { code: 'ECONNREFUSED', isAxiosError: true });
        throw err;
      });
      const result = await service.forward(baseReq);
      expect(result.status).toBe(503);
      expect((result.data as { error: string }).error).toBe('Service Unavailable');
    });

    it('deve retornar 503 quando host não encontrado (ENOTFOUND)', async () => {
      mock.onGet('http://weather-api:8080/api/v1/weather/current').replyOnce(() => {
        const err = Object.assign(new Error('ENOTFOUND'), { code: 'ENOTFOUND', isAxiosError: true });
        throw err;
      });
      const result = await service.forward(baseReq);
      expect(result.status).toBe(503);
    });

    it('deve retornar 504 em timeout (ETIMEDOUT)', async () => {
      mock.onGet('http://weather-api:8080/api/v1/weather/current').replyOnce(() => {
        const err = Object.assign(new Error('ETIMEDOUT'), { code: 'ETIMEDOUT', isAxiosError: true });
        throw err;
      });
      const result = await service.forward(baseReq);
      expect(result.status).toBe(504);
      expect((result.data as { error: string }).error).toBe('Gateway Timeout');
    });

    it('deve relançar erros desconhecidos', async () => {
      mock.onGet('http://weather-api:8080/api/v1/weather/current').replyOnce(() => {
        const err = Object.assign(new Error('Unknown'), { code: 'EUNKNOWN', isAxiosError: true });
        throw err;
      });
      await expect(service.forward(baseReq)).rejects.toThrow('Unknown');
    });
  });
});
