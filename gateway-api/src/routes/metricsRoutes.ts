import os from "os";
import { statfs } from "fs/promises";
import { FastifyInstance } from "fastify";

// ── Helpers INMET ──────────────────────────────────────────────────────────

interface InmetAlert {
  id: string;
  event: string;
  severity: "perigo" | "perigo_potencial" | "atencao";
  start: string;
  end: string;
  description: string;
  areas: string[];
}

function unescapeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function extractTableField(html: string, fieldName: string): string {
  const re = new RegExp(
    "<th[^>]*>\\s*" + fieldName + "\\s*</th>\\s*<td[^>]*>([\\s\\S]*?)</td>",
    "i",
  );
  const m = html.match(re);
  if (!m) return "";
  return m[1].replace(/<[^>]+>/g, "").trim();
}

function parseSeverity(raw: string): InmetAlert["severity"] {
  const lower = raw.toLowerCase();
  if (lower.includes("perigo potencial")) return "perigo_potencial";
  if (lower.includes("perigo")) return "perigo";
  return "atencao";
}

function parseInmetRss(xml: string): InmetAlert[] {
  const alerts: InmetAlert[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let itemMatch: RegExpExecArray | null;

  while ((itemMatch = itemRe.exec(xml)) !== null) {
    const item = itemMatch[1];
    const guidMatch = item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
    const rawGuid = guidMatch ? guidMatch[1].trim() : "";
    const id = rawGuid.split("/").filter(Boolean).pop() ?? rawGuid;

    const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? unescapeHtml(titleMatch[1]).trim() : "";

    const descTagMatch = item.match(/<description>([\s\S]*?)<\/description>/i);
    const htmlDesc = descTagMatch ? unescapeHtml(descTagMatch[1]) : "";

    const event = extractTableField(htmlDesc, "Evento") || title;
    const severityRaw = extractTableField(htmlDesc, "Severidade");
    const severity = parseSeverity(severityRaw || title);
    const start = extractTableField(htmlDesc, "In(?:í|i)cio");
    const end = extractTableField(htmlDesc, "Fim");
    const description = extractTableField(htmlDesc, "Descri(?:ç|c)(?:ã|a)o");
    const areaRaw = extractTableField(htmlDesc, "(?:Á|A)rea");
    const areaClean = areaRaw
      .replace(/^Aviso para as\s+[Áa]reas?:\s*/i, "")
      .trim();
    const areas = areaClean
      ? areaClean
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean)
      : [];

    if (id) alerts.push({ id, event, severity, start, end, description, areas });
  }
  return alerts;
}

// ── Rotas ─────────────────────────────────────────────────────────────────

export function registerMetricsRoutes(server: FastifyInstance): void {
  server.get("/api/metrics", async (_req, reply) => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const loadAvg = os.loadavg();
    const cpus = os.cpus();
    const mem = process.memoryUsage();

    let disk: { total: number; free: number; available: number } | null = null;
    try {
      const stats = await statfs("/");
      disk = {
        total: stats.blocks * stats.bsize,
        free: stats.bfree * stats.bsize,
        available: stats.bavail * stats.bsize,
      };
    } catch {
      disk = null;
    }

    return reply.send({
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpuModel: cpus[0]?.model ?? "Unknown",
        cpuCount: cpus.length,
        loadAvg1: loadAvg[0],
        loadAvg5: loadAvg[1],
        loadAvg15: loadAvg[2],
        totalMem,
        freeMem,
        uptime: os.uptime(),
      },
      process: {
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        rss: mem.rss,
        uptime: process.uptime(),
        nodeVersion: process.version,
      },
      disk,
      timestamp: Date.now(),
    });
  });

  server.get("/api/inmet-alerts", async (_req, reply) => {
    try {
      const res = await fetch("https://apiprevmet3.inmet.gov.br/avisos/rss", {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return reply.send([]);
      const xml = await res.text();
      return reply
        .header("Cache-Control", "s-maxage=1800, stale-while-revalidate")
        .send(parseInmetRss(xml));
    } catch {
      return reply.send([]);
    }
  });
}
