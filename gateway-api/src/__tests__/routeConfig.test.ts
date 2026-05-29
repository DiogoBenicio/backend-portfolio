jest.mock("../config/env", () => ({
  env: {
    jwtSecret: "test-secret",
    jwtExpiresIn: "2h",
    port: 4000,
    weatherApiUrl: "http://weather-api:8080",
    npsApiUrl: "http://nps-api:3001",
  },
}));

import {
  isPublicRoute,
  resolveUpstream,
  PATH_REWRITES,
} from "../config/routeConfig";

describe("isPublicRoute", () => {
  it.each([
    ["POST", "/api/auth/login"],
    ["GET", "/api/weather/current"],
    ["GET", "/api/weather/current?city=SP"],
    ["GET", "/api/weather/forecast"],
    ["GET", "/api/weather/forecast?city=RJ&days=5"],
    ["POST", "/api/nps/responses"],
    ["GET", "/api/nps/summary"],
    ["GET", "/api/nps/summary?page=portfolio"],
    ["GET", "/api/metrics"],
    ["GET", "/api/inmet-alerts"],
  ])("%s %s deve ser pública", (method, path) => {
    expect(isPublicRoute(method, path)).toBe(true);
  });

  it.each([
    ["GET", "/api/weather/history"],
    ["DELETE", "/api/nps/responses"],
    ["POST", "/api/weather/refresh"],
    ["GET", "/api/auth/login"],
    ["GET", "/dashboard"],
    ["POST", "/api/metrics"],
    ["GET", "/api/metrics/extra"],
  ])("%s %s deve ser protegida", (method, path) => {
    expect(isPublicRoute(method, path)).toBe(false);
  });

  it("GET /api/nps/responses deve ser protegida (requer JWT)", () => {
    expect(isPublicRoute("GET", "/api/nps/responses")).toBe(false);
  });
});

describe("resolveUpstream", () => {
  it("deve resolver /api/weather/* para weather-api com path reescrito", () => {
    const result = resolveUpstream("/api/weather/current");
    expect(result).not.toBeNull();
    expect(result!.rewrittenPath).toBe("/api/v1/weather/current");
    expect(result!.baseUrl).toBe("http://weather-api:8080");
  });

  it("deve resolver /api/nps/* para nps-api com path reescrito", () => {
    const result = resolveUpstream("/api/nps/responses");
    expect(result).not.toBeNull();
    expect(result!.rewrittenPath).toBe("/api/v1/nps/responses");
    expect(result!.baseUrl).toBe("http://nps-api:3001");
  });

  it("deve preservar sufixo do path reescrito", () => {
    expect(resolveUpstream("/api/weather/forecast")!.rewrittenPath).toBe(
      "/api/v1/weather/forecast",
    );
    expect(resolveUpstream("/api/nps/summary")!.rewrittenPath).toBe(
      "/api/v1/nps/summary",
    );
  });

  it("deve retornar null para path fora dos upstreams", () => {
    expect(resolveUpstream("/health")).toBeNull();
    expect(resolveUpstream("/api/auth/login")).toBeNull();
    expect(resolveUpstream("/api/unknown/route")).toBeNull();
  });
});

describe("PATH_REWRITES", () => {
  it("deve ter 3 regras (health, weather e nps)", () => {
    expect(PATH_REWRITES).toHaveLength(3);
  });

  it("regra health: /api/weather/health → /actuator/health", () => {
    const rule = PATH_REWRITES[0];
    expect("/api/weather/health".replace(rule.from, rule.to)).toBe(
      "/actuator/health",
    );
  });

  it("regra weather: /api/weather/forecast → /api/v1/weather/forecast", () => {
    const rule = PATH_REWRITES[1];
    expect("/api/weather/forecast".replace(rule.from, rule.to)).toBe(
      "/api/v1/weather/forecast",
    );
  });

  it("regra nps: /api/nps/summary → /api/v1/nps/summary", () => {
    const rule = PATH_REWRITES[2];
    expect("/api/nps/summary".replace(rule.from, rule.to)).toBe(
      "/api/v1/nps/summary",
    );
  });
});
