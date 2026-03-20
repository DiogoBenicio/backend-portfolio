import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { randomUUID } from 'crypto';

export interface ProxyRequest {
  baseUrl: string;
  path: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
  clientIp?: string;
}

export interface ProxyResponse {
  status: number;
  data: unknown;
  headers: Record<string, string>;
}

export class ProxyService {
  async forward(req: ProxyRequest): Promise<ProxyResponse> {
    const requestId = randomUUID();

    // Limpa e constrói os headers para o upstream
    const forwardHeaders: Record<string, string> = {
      'x-request-id': requestId,
      'x-forwarded-for': req.clientIp ?? 'unknown',
      'x-forwarded-by': 'api-gateway',
    };

    // Repassa Content-Type se presente
    const contentType = req.headers['content-type'];
    if (contentType && typeof contentType === 'string') {
      forwardHeaders['content-type'] = contentType;
    }

    // Repassa Authorization para o upstream (serviços internos podem ignorar, mas boa prática)
    const auth = req.headers['authorization'];
    if (auth && typeof auth === 'string') {
      forwardHeaders['x-user-token'] = auth;
    }

    const config: AxiosRequestConfig = {
      method: req.method,
      url: `${req.baseUrl}${req.path}`,
      headers: forwardHeaders,
      params: req.query,
      data: req.body,
      validateStatus: () => true, // não lançar erro para qualquer status HTTP
      timeout: 15000,
    };

    try {
      const response = await axios(config);

      const responseHeaders: Record<string, string> = {};
      const contentTypeRes = response.headers['content-type'];
      if (contentTypeRes) responseHeaders['content-type'] = String(contentTypeRes);

      return {
        status: response.status,
        data: response.data,
        headers: responseHeaders,
      };
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.code === 'ECONNREFUSED' || axiosErr.code === 'ENOTFOUND') {
        return {
          status: 503,
          data: { error: 'Service Unavailable', message: 'Serviço interno indisponível' },
          headers: {},
        };
      }
      if (axiosErr.code === 'ETIMEDOUT' || axiosErr.code === 'ECONNABORTED') {
        return {
          status: 504,
          data: { error: 'Gateway Timeout', message: 'Timeout ao contatar serviço interno' },
          headers: {},
        };
      }
      throw err;
    }
  }
}

export const proxyService = new ProxyService();
