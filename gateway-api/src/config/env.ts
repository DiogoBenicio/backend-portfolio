function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Variável de ambiente obrigatória não definida: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  port: Number(optional('PORT', '4000')),
  nodeEnv: optional('NODE_ENV', 'development'),

  jwtSecret: optional('JWT_SECRET', 'dev_secret_change_in_production_min_32_chars'),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '2h'),

  adminUser: optional('ADMIN_USER', 'admin'),
  adminPass: optional('ADMIN_PASS', 'admin2025'),

  weatherApiUrl: optional('WEATHER_API_URL', 'http://localhost:8080'),
  npsApiUrl: optional('NPS_API_URL', 'http://localhost:3001'),
} as const;
