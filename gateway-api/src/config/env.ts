function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  port: (() => {
    const p = Number(optional("PORT", "4000"));
    if (!Number.isInteger(p) || p < 1 || p > 65535)
      throw new Error(`PORT inválido: "${process.env.PORT}"`);
    return p;
  })(),
  nodeEnv: optional("NODE_ENV", "development"),

  weatherApiUrl: optional("WEATHER_API_URL", "http://localhost:8080"),
  npsApiUrl: optional("NPS_API_URL", "http://localhost:3001"),
  corsOrigins: optional(
    "CORS_ORIGINS",
    "http://localhost,http://localhost:3000,http://nginx",
  )
    .split(",")
    .map((s) => s.trim()),
} as const;
