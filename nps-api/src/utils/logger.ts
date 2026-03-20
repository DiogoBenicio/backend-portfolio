// Logger colorido com ANSI codes nativos — zero dependências extras
const C = {
  reset:   '\x1b[0m',
  red:     '\x1b[31m',
  yellow:  '\x1b[33m',
  cyan:    '\x1b[36m',
  green:   '\x1b[32m',
  gray:    '\x1b[90m',
  bold:    '\x1b[1m',
  magenta: '\x1b[35m',
  blue:    '\x1b[34m',
} as const;

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 23);
}

function statusColor(status: number): string {
  if (status >= 500) return C.red;
  if (status >= 400) return C.yellow;
  if (status >= 300) return C.cyan;
  return C.green;
}

export const logger = {
  info(msg: string, ...args: unknown[]): void {
    console.log(`${C.cyan}[INFO ]${C.reset}  ${timestamp()}  ${msg}`, ...args);
  },
  warn(msg: string, ...args: unknown[]): void {
    console.warn(`${C.yellow}[WARN ]${C.reset}  ${timestamp()}  ${msg}`, ...args);
  },
  error(msg: string, ...args: unknown[]): void {
    console.error(`${C.red}[ERROR]${C.reset}  ${timestamp()}  ${msg}`, ...args);
  },
  debug(msg: string, ...args: unknown[]): void {
    console.log(`${C.gray}[DEBUG]${C.reset}  ${timestamp()}  ${msg}`, ...args);
  },
  access(method: string, url: string, status: number, ms: number, ip: string): void {
    const sc = statusColor(status);
    console.log(
      `${C.gray}→${C.reset} ${C.bold}${method.padEnd(6)}${C.reset} ${url.padEnd(45)} ` +
      `${sc}${status}${C.reset}  ${ms.toFixed(1)}ms  ${C.gray}${ip}${C.reset}`,
    );
  },
};

export function printBanner(): void {
  const { cyan, reset, bold } = C;
  const port = process.env.PORT ?? '3001';
  const env  = process.env.NODE_ENV ?? 'development';
  const dbUrl = process.env.DATABASE_URL ?? '';
  // Mascara a senha na URL: postgresql://user:PASS@host → postgresql://user:***@host
  const dbMasked = dbUrl.replace(/:([^@]+)@/, ':***@') || '(não configurado)';
  console.log(cyan);
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  ███╗   ██╗██████╗ ███████╗                  ║');
  console.log('║  ████╗  ██║██╔══██╗██╔════╝                  ║');
  console.log('║  ██╔██╗ ██║██████╔╝███████╗                  ║');
  console.log('║  ██║╚██╗██║██╔═══╝ ╚════██║                  ║');
  console.log('║  ██║ ╚████║██║     ███████║                  ║');
  console.log('║  ╚═╝  ╚═══╝╚═╝     ╚══════╝                  ║');
  console.log('║                                              ║');
  console.log('║  NPS-API  ·  Fastify + Prisma + PostgreSQL   ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`${reset}${bold}  Porta: ${port} | Env: ${env} | DB: ${dbMasked}${reset}`);
  console.log();
}
