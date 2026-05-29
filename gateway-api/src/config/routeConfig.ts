import { env } from "./env";

export const UPSTREAMS = {
  weather: env.weatherApiUrl,
  nps: env.npsApiUrl,
} as const;

export const PATH_REWRITES: Array<{ from: RegExp; to: string }> = [
  { from: /^\/api\/weather\/health$/, to: "/actuator/health" },
  { from: /^\/api\/weather\/(.*)/, to: "/api/v1/weather/$1" },
  { from: /^\/api\/nps\/(.*)/, to: "/api/v1/nps/$1" },
];

export function resolveUpstream(
  path: string,
): { baseUrl: string; rewrittenPath: string } | null {
  for (const rule of PATH_REWRITES) {
    if (rule.from.test(path)) {
      const rewrittenPath = path.replace(rule.from, rule.to);
      const baseUrl = path.startsWith("/api/weather")
        ? UPSTREAMS.weather
        : UPSTREAMS.nps;
      return { baseUrl, rewrittenPath };
    }
  }
  return null;
}
