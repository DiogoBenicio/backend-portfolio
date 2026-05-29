import axios, { AxiosRequestConfig, AxiosError } from "axios";
import { randomUUID } from "crypto";

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
    const existingForwardedFor = req.headers["x-forwarded-for"];
    const forwardedFor = existingForwardedFor
      ? `${existingForwardedFor}, ${req.clientIp ?? "unknown"}`
      : (req.clientIp ?? "unknown");

    const forwardHeaders: Record<string, string> = {
      "x-request-id": requestId,
      "x-forwarded-for": forwardedFor,
      "x-forwarded-by": "api-gateway",
    };

    // Repassa Content-Type se presente
    const contentType = req.headers["content-type"];
    if (contentType && typeof contentType === "string") {
      forwardHeaders["content-type"] = contentType;
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
      const contentTypeRes = response.headers["content-type"];
      if (contentTypeRes)
        responseHeaders["content-type"] = String(contentTypeRes);

      // Sanitize upstream 5xx non-JSON responses to avoid leaking internal details
      if (response.status >= 500) {
        const ct = String(response.headers["content-type"] ?? "");
        if (!ct.includes("application/json")) {
          return {
            status: response.status,
            data: {
              error: "Service Error",
              message: "Erro interno no serviço de destino",
            },
            headers: { "content-type": "application/json" },
          };
        }
      }

      return {
        status: response.status,
        data: response.data,
        headers: responseHeaders,
      };
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (
        ["ECONNREFUSED", "ENOTFOUND", "ECONNRESET"].includes(
          axiosErr.code ?? "",
        )
      ) {
        return {
          status: 503,
          data: {
            error: "Service Unavailable",
            message: "Serviço interno indisponível",
          },
          headers: {},
        };
      }
      if (axiosErr.code === "ETIMEDOUT" || axiosErr.code === "ECONNABORTED") {
        return {
          status: 504,
          data: {
            error: "Gateway Timeout",
            message: "Timeout ao contatar serviço interno",
          },
          headers: {},
        };
      }
      throw err;
    }
  }
}

export const proxyService = new ProxyService();
