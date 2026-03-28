import { env } from './env';

export const UPSTREAMS = {
  weather: env.weatherApiUrl,
  nps: env.npsApiUrl,
} as const;

// Regras de reescrita de path: /api/weather/* → /api/v1/weather/*
export const PATH_REWRITES: Array<{ from: RegExp; to: string }> = [
  { from: /^\/api\/weather\/(.*)/, to: '/api/v1/weather/$1' },
  { from: /^\/api\/nps\/(.*)/, to: '/api/v1/nps/$1' },
];

// Rotas públicas — não exigem JWT
export const PUBLIC_ROUTES: Array<{ method: string; pattern: RegExp }> = [
  { method: 'POST', pattern: /^\/api\/auth\/login$/ },
  { method: 'GET',  pattern: /^\/api\/weather\/current/ },
  { method: 'GET',  pattern: /^\/api\/weather\/forecast/ },
  { method: 'GET',  pattern: /^\/api\/weather\/sensors/ },
  { method: 'GET',  pattern: /^\/api\/weather\/calendar/ },
  { method: 'POST', pattern: /^\/api\/weather\/populate/ },
  { method: 'POST',   pattern: /^\/api\/nps\/responses$/ },
  { method: 'GET',    pattern: /^\/api\/nps\/responses/ },
  { method: 'DELETE', pattern: /^\/api\/nps\/responses\// },
  { method: 'GET',    pattern: /^\/api\/nps\/summary/ },
];

export function isPublicRoute(method: string, path: string): boolean {
  return PUBLIC_ROUTES.some(
    (r) => r.method === method && r.pattern.test(path)
  );
}

export function resolveUpstream(path: string): { baseUrl: string; rewrittenPath: string } | null {
  for (const rule of PATH_REWRITES) {
    if (rule.from.test(path)) {
      const rewrittenPath = path.replace(rule.from, rule.to);
      const baseUrl = path.startsWith('/api/weather') ? UPSTREAMS.weather : UPSTREAMS.nps;
      return { baseUrl, rewrittenPath };
    }
  }
  return null;
}
