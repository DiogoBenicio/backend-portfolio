import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaNpsResponseRepository } from "../adapter/out/database/PrismaNpsResponseRepository";
import { Prisma } from "@prisma/client";

const mockPrisma = {
  npsResponse: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    delete: vi.fn(),
  },
};

describe("PrismaNpsResponseRepository", () => {
  let repo: PrismaNpsResponseRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PrismaNpsResponseRepository(mockPrisma as never);
  });

  // ─── create ──────────────────────────────────────────────────────────────

  describe("create", () => {
    it("deve chamar prisma.create com os campos corretos", async () => {
      const input = { score: 9, comment: "Ótimo!", name: "Ana", page: "portfolio" };
      const created = { id: "1", ...input, createdAt: new Date() };
      mockPrisma.npsResponse.create.mockResolvedValue(created);

      const result = await repo.create(input);

      expect(mockPrisma.npsResponse.create).toHaveBeenCalledWith({
        data: { score: 9, comment: "Ótimo!", name: "Ana", page: "portfolio" },
      });
      expect(result).toEqual(created);
    });

    it("deve funcionar sem comment e name", async () => {
      const input = { score: 7, page: "portfolio" };
      mockPrisma.npsResponse.create.mockResolvedValue({ id: "2", score: 7, comment: null, name: null, page: "portfolio", createdAt: new Date() });

      await repo.create(input);

      expect(mockPrisma.npsResponse.create).toHaveBeenCalledWith({
        data: { score: 7, comment: undefined, name: undefined, page: "portfolio" },
      });
    });
  });

  // ─── findMany ─────────────────────────────────────────────────────────────

  describe("findMany", () => {
    it("deve aplicar filtro de page quando fornecido", async () => {
      mockPrisma.npsResponse.findMany.mockResolvedValue([]);
      mockPrisma.npsResponse.count.mockResolvedValue(0);

      await repo.findMany({ page: "portfolio", limit: 10, offset: 0 });

      expect(mockPrisma.npsResponse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { page: "portfolio" } })
      );
      expect(mockPrisma.npsResponse.count).toHaveBeenCalledWith({ where: { page: "portfolio" } });
    });

    it("deve usar where vazio quando page não é fornecido", async () => {
      mockPrisma.npsResponse.findMany.mockResolvedValue([]);
      mockPrisma.npsResponse.count.mockResolvedValue(0);

      await repo.findMany({ limit: 5, offset: 10 });

      expect(mockPrisma.npsResponse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {}, take: 5, skip: 10 })
      );
    });

    it("deve retornar data e total", async () => {
      const data = [{ id: "1", score: 9, comment: null, page: "portfolio", createdAt: new Date() }];
      mockPrisma.npsResponse.findMany.mockResolvedValue(data);
      mockPrisma.npsResponse.count.mockResolvedValue(1);

      const result = await repo.findMany({ limit: 10, offset: 0 });

      expect(result.data).toEqual(data);
      expect(result.total).toBe(1);
    });

    it("deve ordenar por createdAt desc", async () => {
      mockPrisma.npsResponse.findMany.mockResolvedValue([]);
      mockPrisma.npsResponse.count.mockResolvedValue(0);

      await repo.findMany({ limit: 10, offset: 0 });

      expect(mockPrisma.npsResponse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: "desc" } })
      );
    });
  });

  // ─── findAllByPage ────────────────────────────────────────────────────────

  describe("findAllByPage", () => {
    it("deve filtrar por page quando fornecido", async () => {
      mockPrisma.npsResponse.findMany.mockResolvedValue([]);

      await repo.findAllByPage("portfolio");

      expect(mockPrisma.npsResponse.findMany).toHaveBeenCalledWith({
        where: { page: "portfolio" },
        orderBy: { createdAt: "desc" },
      });
    });

    it("deve retornar todos quando page não fornecido", async () => {
      mockPrisma.npsResponse.findMany.mockResolvedValue([]);

      await repo.findAllByPage(undefined);

      expect(mockPrisma.npsResponse.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: "desc" },
      });
    });
  });

  // ─── deleteById ───────────────────────────────────────────────────────────

  describe("deleteById", () => {
    it("deve chamar prisma.delete com o id correto", async () => {
      mockPrisma.npsResponse.delete.mockResolvedValue({});

      await repo.deleteById("abc-123");

      expect(mockPrisma.npsResponse.delete).toHaveBeenCalledWith({ where: { id: "abc-123" } });
    });

    it("deve lançar erro com statusCode 404 quando registro não existe (P2025)", async () => {
      const p2025 = new Prisma.PrismaClientKnownRequestError("not found", {
        code: "P2025",
        clientVersion: "5.0.0",
      });
      mockPrisma.npsResponse.delete.mockRejectedValue(p2025);

      await expect(repo.deleteById("nao-existe")).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("deve repassar outros erros do Prisma sem modificar", async () => {
      const dbErr = new Error("Connection refused");
      mockPrisma.npsResponse.delete.mockRejectedValue(dbErr);

      await expect(repo.deleteById("qualquer")).rejects.toBe(dbErr);
    });
  });
});
