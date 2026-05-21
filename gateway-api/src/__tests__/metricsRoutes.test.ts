jest.mock("../config/env", () => ({
  env: {
    jwtSecret: "test-secret",
    jwtExpiresIn: "2h",
    port: 4000,
    weatherApiUrl: "http://weather-api:8080",
    npsApiUrl: "http://nps-api:3001",
  },
}));

jest.mock("fs/promises", () => ({
  statfs: jest.fn().mockResolvedValue({
    blocks: 1000,
    bfree: 400,
    bavail: 380,
    bsize: 4096,
  }),
}));

import Fastify, { FastifyInstance } from "fastify";
import {
  registerMetricsRoutes,
  unescapeHtml,
  extractTableField,
  parseSeverity,
  parseInmetRss,
} from "../routes/metricsRoutes";

// ── RSS de exemplo usado em vários testes ─────────────────────────────────────

const RSS_WITH_ONE_ALERT = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>INMET Avisos</title>
    <item>
      <title>Chuvas Intensas</title>
      <guid>https://apiprevmet3.inmet.gov.br/avisos/1234</guid>
      <description>&lt;table&gt;
        &lt;tr&gt;&lt;th&gt;Evento&lt;/th&gt;&lt;td&gt;Chuvas Intensas&lt;/td&gt;&lt;/tr&gt;
        &lt;tr&gt;&lt;th&gt;Severidade&lt;/th&gt;&lt;td&gt;Perigo&lt;/td&gt;&lt;/tr&gt;
        &lt;tr&gt;&lt;th&gt;Início&lt;/th&gt;&lt;td&gt;20/05/2026 08:00&lt;/td&gt;&lt;/tr&gt;
        &lt;tr&gt;&lt;th&gt;Fim&lt;/th&gt;&lt;td&gt;21/05/2026 08:00&lt;/td&gt;&lt;/tr&gt;
        &lt;tr&gt;&lt;th&gt;Descrição&lt;/th&gt;&lt;td&gt;Chuvas podem atingir 80mm/h&lt;/td&gt;&lt;/tr&gt;
        &lt;tr&gt;&lt;th&gt;Área&lt;/th&gt;&lt;td&gt;São Paulo, Campinas, Santos&lt;/td&gt;&lt;/tr&gt;
      &lt;/table&gt;</description>
    </item>
  </channel>
</rss>`;

// ── unescapeHtml ──────────────────────────────────────────────────────────────

describe("unescapeHtml", () => {
  it.each([
    ["&amp;", "&"],
    ["&lt;", "<"],
    ["&gt;", ">"],
    ["&quot;", '"'],
    ["&#39;", "'"],
    ["&nbsp;", " "],
  ])("deve converter entidade nomeada %s → %s", (input, expected) => {
    expect(unescapeHtml(input)).toBe(expected);
  });

  it("deve converter entidade decimal &#8805; → ≥", () => {
    expect(unescapeHtml("&#8805;")).toBe("≥");
  });

  it("deve converter entidade hexadecimal &#x2665; → ♥", () => {
    expect(unescapeHtml("&#x2665;")).toBe("♥");
  });

  it("deve converter múltiplas entidades numa string", () => {
    expect(unescapeHtml("Chuva &gt; 100mm &amp; Vento")).toBe(
      "Chuva > 100mm & Vento",
    );
  });

  it("não deve alterar texto sem entidades", () => {
    expect(unescapeHtml("texto normal 123")).toBe("texto normal 123");
  });

  it("não deve alterar string vazia", () => {
    expect(unescapeHtml("")).toBe("");
  });
});

// ── parseSeverity ─────────────────────────────────────────────────────────────

describe("parseSeverity", () => {
  it.each([
    ["Perigo Potencial", "perigo_potencial"],
    ["perigo potencial", "perigo_potencial"],
    ["PERIGO POTENCIAL de Chuvas", "perigo_potencial"],
    ["Perigo", "perigo"],
    ["PERIGO de Enchentes", "perigo"],
    ["Atenção", "atencao"],
    ["aviso comum", "atencao"],
    ["", "atencao"],
  ] as [string, "perigo_potencial" | "perigo" | "atencao"][])(
    "parseSeverity('%s') → %s",
    (input, expected) => {
      expect(parseSeverity(input)).toBe(expected);
    },
  );

  it("deve preferir perigo_potencial sobre perigo quando ambos estão presentes", () => {
    expect(parseSeverity("perigo potencial severo")).toBe("perigo_potencial");
  });
});

// ── extractTableField ─────────────────────────────────────────────────────────

describe("extractTableField", () => {
  const TABLE = `
    <table>
      <tr><th>Evento</th><td>Chuva Intensa</td></tr>
      <tr><th>Severidade</th><td><span>Perigo</span></td></tr>
      <tr><th>Início</th><td>01/01/2026 10:00</td></tr>
      <tr><th>Fim</th><td>02/01/2026 18:00</td></tr>
      <tr><th>Campo Vazio</th><td>  </td></tr>
    </table>`;

  it("deve extrair texto simples de campo existente", () => {
    expect(extractTableField(TABLE, "Evento")).toBe("Chuva Intensa");
  });

  it("deve remover tags HTML internas do valor", () => {
    expect(extractTableField(TABLE, "Severidade")).toBe("Perigo");
  });

  it("deve fazer trim no valor extraído", () => {
    expect(extractTableField(TABLE, "Campo Vazio")).toBe("");
  });

  it("deve retornar string vazia para campo inexistente", () => {
    expect(extractTableField(TABLE, "NaoExiste")).toBe("");
  });

  it("deve ser case-insensitive", () => {
    expect(extractTableField(TABLE, "evento")).toBe("Chuva Intensa");
    expect(extractTableField(TABLE, "EVENTO")).toBe("Chuva Intensa");
  });

  it("deve aceitar padrão regex no fieldName (ex: acentos alternativos)", () => {
    expect(extractTableField(TABLE, "In(?:í|i)cio")).toBe("01/01/2026 10:00");
  });

  it("deve retornar string vazia para HTML vazio", () => {
    expect(extractTableField("", "Evento")).toBe("");
  });
});

// ── parseInmetRss ─────────────────────────────────────────────────────────────

describe("parseInmetRss", () => {
  it("deve retornar array vazio para string vazia", () => {
    expect(parseInmetRss("")).toEqual([]);
  });

  it("deve retornar array vazio para XML sem <item>", () => {
    expect(
      parseInmetRss("<rss><channel><title>T</title></channel></rss>"),
    ).toEqual([]);
  });

  it("deve ignorar item sem GUID", () => {
    const xml = `<rss><channel>
      <item><title>Sem guid</title><description></description></item>
    </channel></rss>`;
    expect(parseInmetRss(xml)).toEqual([]);
  });

  it("deve extrair id a partir da última parte do GUID URL", () => {
    const [alert] = parseInmetRss(RSS_WITH_ONE_ALERT);
    expect(alert.id).toBe("1234");
  });

  it("deve extrair todos os campos corretamente", () => {
    const [alert] = parseInmetRss(RSS_WITH_ONE_ALERT);
    expect(alert.event).toBe("Chuvas Intensas");
    expect(alert.severity).toBe("perigo");
    expect(alert.start).toBe("20/05/2026 08:00");
    expect(alert.end).toBe("21/05/2026 08:00");
    expect(alert.description).toBe("Chuvas podem atingir 80mm/h");
    expect(alert.areas).toEqual(["São Paulo", "Campinas", "Santos"]);
  });

  it("deve usar title como event quando campo Evento está ausente na tabela", () => {
    const xml = `<rss><channel><item>
      <title>Vendaval Forte</title>
      <guid>https://inmet.gov.br/999</guid>
      <description>&lt;table&gt;&lt;/table&gt;</description>
    </item></channel></rss>`;
    const [alert] = parseInmetRss(xml);
    expect(alert.event).toBe("Vendaval Forte");
  });

  it("deve usar title como fallback de severidade quando campo Severidade ausente", () => {
    const xml = `<rss><channel><item>
      <title>Aviso de Perigo Potencial</title>
      <guid>https://inmet.gov.br/888</guid>
      <description>&lt;table&gt;&lt;/table&gt;</description>
    </item></channel></rss>`;
    const [alert] = parseInmetRss(xml);
    expect(alert.severity).toBe("perigo_potencial");
  });

  it("deve retornar severidade 'atencao' como padrão quando nenhuma pista está disponível", () => {
    const xml = `<rss><channel><item>
      <title>Alerta Genérico</title>
      <guid>https://inmet.gov.br/777</guid>
      <description>&lt;table&gt;&lt;/table&gt;</description>
    </item></channel></rss>`;
    const [alert] = parseInmetRss(xml);
    expect(alert.severity).toBe("atencao");
  });

  it("deve parsear múltiplos itens", () => {
    const xml = `<rss><channel>
      <item>
        <guid>https://inmet.gov.br/1</guid>
        <title>Alerta 1</title>
        <description></description>
      </item>
      <item>
        <guid>https://inmet.gov.br/2</guid>
        <title>Alerta 2</title>
        <description></description>
      </item>
    </channel></rss>`;
    const alerts = parseInmetRss(xml);
    expect(alerts).toHaveLength(2);
    expect(alerts[0].id).toBe("1");
    expect(alerts[1].id).toBe("2");
  });

  it("deve dividir areas por vírgula e fazer trim em cada uma", () => {
    const xml = `<rss><channel><item>
      <guid>https://inmet.gov.br/5</guid>
      <title>T</title>
      <description>&lt;table&gt;
        &lt;tr&gt;&lt;th&gt;Área&lt;/th&gt;&lt;td&gt; Rio de Janeiro , Niterói , Petrópolis &lt;/td&gt;&lt;/tr&gt;
      &lt;/table&gt;</description>
    </item></channel></rss>`;
    const [alert] = parseInmetRss(xml);
    expect(alert.areas).toEqual(["Rio de Janeiro", "Niterói", "Petrópolis"]);
  });

  it("deve retornar areas=[] quando campo Área está vazio", () => {
    const xml = `<rss><channel><item>
      <guid>https://inmet.gov.br/6</guid>
      <title>T</title>
      <description>&lt;table&gt;&lt;/table&gt;</description>
    </item></channel></rss>`;
    const [alert] = parseInmetRss(xml);
    expect(alert.areas).toEqual([]);
  });
});

// ── Rotas HTTP ────────────────────────────────────────────────────────────────

describe("GET /api/metrics", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    registerMetricsRoutes(app);
    await app.ready();
  });

  afterAll(() => app.close());

  it("deve retornar 200 com os campos system, process, disk e timestamp", async () => {
    const res = await app.inject({ method: "GET", url: "/api/metrics" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.system).toBeDefined();
    expect(body.process).toBeDefined();
    expect(body.timestamp).toBeDefined();
  });

  it("deve incluir campos numéricos em system", async () => {
    const res = await app.inject({ method: "GET", url: "/api/metrics" });
    const { system } = JSON.parse(res.body);
    expect(typeof system.totalMem).toBe("number");
    expect(typeof system.freeMem).toBe("number");
    expect(typeof system.loadAvg1).toBe("number");
    expect(typeof system.cpuCount).toBe("number");
    expect(system.cpuCount).toBeGreaterThan(0);
  });

  it("deve incluir campos numéricos em process", async () => {
    const res = await app.inject({ method: "GET", url: "/api/metrics" });
    const { process: proc } = JSON.parse(res.body);
    expect(typeof proc.heapUsed).toBe("number");
    expect(typeof proc.heapTotal).toBe("number");
    expect(typeof proc.rss).toBe("number");
    expect(proc.nodeVersion).toMatch(/^v\d+/);
  });

  it("deve incluir disk com total/free/available quando statfs disponível", async () => {
    const res = await app.inject({ method: "GET", url: "/api/metrics" });
    const { disk } = JSON.parse(res.body);
    expect(disk).not.toBeNull();
    expect(disk.total).toBe(1000 * 4096);
    expect(disk.free).toBe(400 * 4096);
    expect(disk.available).toBe(380 * 4096);
  });

  it("deve retornar disk=null quando statfs falhar", async () => {
    const { statfs } = jest.requireMock("fs/promises") as { statfs: jest.Mock };
    statfs.mockRejectedValueOnce(new Error("ENOSYS"));

    const res = await app.inject({ method: "GET", url: "/api/metrics" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).disk).toBeNull();
  });
});

describe("GET /api/inmet-alerts", () => {
  let app: FastifyInstance;
  let fetchSpy: jest.SpyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    registerMetricsRoutes(app);
    await app.ready();
  });

  afterAll(() => app.close());

  beforeEach(() => {
    fetchSpy = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(RSS_WITH_ONE_ALERT, { status: 200 }));
  });

  afterEach(() => fetchSpy.mockRestore());

  it("deve retornar 200 com array de alertas para RSS válido", async () => {
    const res = await app.inject({ method: "GET", url: "/api/inmet-alerts" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("1234");
  });

  it("deve retornar array vazio quando INMET responde com erro HTTP", async () => {
    fetchSpy.mockResolvedValueOnce(new Response("", { status: 503 }));
    const res = await app.inject({ method: "GET", url: "/api/inmet-alerts" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual([]);
  });

  it("deve retornar array vazio quando fetch lança exceção (timeout/rede)", async () => {
    fetchSpy.mockRejectedValueOnce(
      Object.assign(new Error("The operation was aborted"), {
        name: "AbortError",
      }),
    );
    const res = await app.inject({ method: "GET", url: "/api/inmet-alerts" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual([]);
  });

  it("deve incluir header Cache-Control na resposta com alertas", async () => {
    const res = await app.inject({ method: "GET", url: "/api/inmet-alerts" });
    expect(res.headers["cache-control"]).toContain("s-maxage=1800");
  });

  it("deve chamar a URL correta do INMET", async () => {
    await app.inject({ method: "GET", url: "/api/inmet-alerts" });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://apiprevmet3.inmet.gov.br/avisos/rss",
      expect.objectContaining({ headers: { "User-Agent": "Mozilla/5.0" } }),
    );
  });
});
