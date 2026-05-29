function required(key: string): string {
  const value = process.env[key];
  if (!value)
    throw new Error(`Variável de ambiente obrigatória não definida: ${key}`);
  return value;
}

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

  jwtSecret: (() => {
    const secret = required("JWT_SECRET");
    if (secret.length < 32)
      throw new Error(
        `JWT_SECRET muito curto (mín. 32 chars): tem ${secret.length}`,
      );
    return secret;
  })(),
  jwtExpiresIn: optional("JWT_EXPIRES_IN", "2h"),

  adminUser: required("ADMIN_USER"),
  adminPass: required("ADMIN_PASS"),

  weatherApiUrl: optional("WEATHER_API_URL", "http://localhost:8080"),
  npsApiUrl: optional("NPS_API_URL", "http://localhost:3001"),
} as const;
