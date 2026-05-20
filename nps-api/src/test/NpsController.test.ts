import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import Fastify, { FastifyInstance } from "fastify";
import { registerNpsRoutes } from "../adapter/in/http/NpsController";
import type { SubmitNpsScoreUseCase } from "../domain/port/in/SubmitNpsScoreUseCase";
import type { GetNpsSummaryUseCase } from "../domain/port/in/GetNpsSummaryUseCase";
import type { ListNpsResponsesUseCase } from "../domain/port/in/ListNpsResponsesUseCase";
import type { NpsResponseRepository } from "../domain/port/out/NpsResponseRepository";
import type { NpsResponse } from "../domain/model/NpsResponse";
import type { NpsSummary } from "../domain/model/NpsSummary";

function makeResponse(overrides: Partial<NpsResponse> = {}): NpsResponse {
  return {
    id: "test-id",
    score: 9,
    comment: null,
    page: "portfolio",
    createdAt: new Date("2025-01-01T00:00:00Z"),
    ...overrides,
  };
}

function makeSummary(): NpsSummary {
  return {
    page: "portfolio",
    totalResponses: 3,
    npsScore: 33,
    zone: "Aperfeiçoamento",
    promoters: 2,
    passives: 0,
    detractors: 1,
    distribution: { 0:0,1:0,2:0,3:0,4:0,5:0,6:1,7:0,8:0,9:1,10:1 },
  };
}

describe("NpsController — rotas HTTP", () => {
  let app: FastifyInstance;
  let submitUseCase: SubmitNpsScoreUseCase;
  let summaryUseCase: GetNpsSummaryUseCase;
  let listUseCase: ListNpsResponsesUseCase;
  let repository: NpsResponseRepository;

  beforeAll(async () => {
    submitUseCase = { execute: vi.fn() };
    summaryUseCase = { execute: vi.fn() };
    listUseCase = { execute: vi.fn() };
    repository = {
      create: vi.fn(),
      findMany: vi.fn(),
      findAllByPage: vi.fn(),
      deleteById: vi.fn(),
    };

    app = Fastify({ logger: false });
    registerNpsRoutes(app, submitUseCase, summaryUseCase, listUseCase, repository);
    await app.ready();
  });

  afterAll(() => app.close());

  // ─── POST /api/v1/nps/responses ──────────────────────────────────────────

  describe("POST /api/v1/nps/responses", () => {
    it("deve retornar 201 com a resposta criada", async () => {
      vi.mocked(submitUseCase.execute).mockResolvedValue(makeResponse());

      const res = await app.inject({
        method: "POST",
        url: "/api/v1/nps/responses",
        payload: { score: 9, comment: "Ótimo!", page: "portfolio" },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.id).toBe("test-id");
      expect(body.score).toBe(9);
    });

    it("deve retornar 422 para score ausente", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/nps/responses",
        payload: { comment: "sem score" },
      });

      expect(res.statusCode).toBe(400);
    });

    it("deve retornar 422 para score fora do range (11)", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/nps/responses",
        payload: { score: 11 },
      });

      expect(res.statusCode).toBe(400);
    });

    it("deve retornar 500 quando use case lança erro", async () => {
      vi.mocked(submitUseCase.execute).mockRejectedValue(new Error("db down"));

      const res = await app.inject({
        method: "POST",
        url: "/api/v1/nps/responses",
        payload: { score: 5 },
      });

      expect(res.statusCode).toBe(500);
    });
  });

  // ─── GET /api/v1/nps/summary ─────────────────────────────────────────────

  describe("GET /api/v1/nps/summary", () => {
    it("deve retornar 200 com o sumário", async () => {
      vi.mocked(summaryUseCase.execute).mockResolvedValue(makeSummary());

      const res = await app.inject({
        method: "GET",
        url: "/api/v1/nps/summary?page=portfolio",
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.npsScore).toBe(33);
      expect(body.zone).toBe("Aperfeiçoamento");
    });

    it("deve chamar o use case com o page correto", async () => {
      vi.mocked(summaryUseCase.execute).mockResolvedValue(makeSummary());

      await app.inject({ method: "GET", url: "/api/v1/nps/summary?page=portfolio" });

      expect(summaryUseCase.execute).toHaveBeenCalledWith("portfolio");
    });

    it("deve funcionar sem page (undefined)", async () => {
      vi.mocked(summaryUseCase.execute).mockResolvedValue(makeSummary());

      await app.inject({ method: "GET", url: "/api/v1/nps/summary" });

      expect(summaryUseCase.execute).toHaveBeenCalledWith(undefined);
    });
  });

  // ─── GET /api/v1/nps/responses ───────────────────────────────────────────

  describe("GET /api/v1/nps/responses", () => {
    it("deve retornar 200 com lista paginada", async () => {
      vi.mocked(listUseCase.execute).mockResolvedValue({
        data: [makeResponse()],
        total: 1,
        limit: 10,
        offset: 0,
      });

      const res = await app.inject({ method: "GET", url: "/api/v1/nps/responses" });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.total).toBe(1);
      expect(body.data).toHaveLength(1);
    });

    it("deve repassar limit e offset ao use case", async () => {
      vi.mocked(listUseCase.execute).mockResolvedValue({ data: [], total: 0, limit: 5, offset: 10 });

      await app.inject({ method: "GET", url: "/api/v1/nps/responses?limit=5&offset=10" });

      expect(listUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 5, offset: 10 })
      );
    });
  });

  // ─── DELETE /api/v1/nps/responses/:id ────────────────────────────────────

  describe("DELETE /api/v1/nps/responses/:id", () => {
    it("deve retornar 204 quando deletion ocorre com sucesso", async () => {
      vi.mocked(repository.deleteById).mockResolvedValue(undefined);

      const res = await app.inject({ method: "DELETE", url: "/api/v1/nps/responses/abc-123" });

      expect(res.statusCode).toBe(204);
      expect(repository.deleteById).toHaveBeenCalledWith("abc-123");
    });

    it("deve retornar 404 quando registro não existe (statusCode 404)", async () => {
      const notFound = Object.assign(new Error("Resposta NPS não encontrada: xyz"), { statusCode: 404 });
      vi.mocked(repository.deleteById).mockRejectedValue(notFound);

      const res = await app.inject({ method: "DELETE", url: "/api/v1/nps/responses/xyz" });

      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.body);
      expect(body.error).toBe("Not Found");
    });

    it("deve retornar 500 para erro genérico", async () => {
      vi.mocked(repository.deleteById).mockRejectedValue(new Error("db down"));

      const res = await app.inject({ method: "DELETE", url: "/api/v1/nps/responses/any" });

      expect(res.statusCode).toBe(500);
    });
  });

  // ─── GET /api/v1/health ──────────────────────────────────────────────────

  describe("GET /api/v1/health", () => {
    it("deve retornar 200 com status ok", async () => {
      const res = await app.inject({ method: "GET", url: "/api/v1/health" });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).status).toBe("ok");
    });
  });
});
