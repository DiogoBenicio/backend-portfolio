jest.mock("../config/env", () => ({
  env: {
    jwtSecret: "test-secret",
    jwtExpiresIn: "2h",
    port: 4000,
    weatherApiUrl: "http://weather-api:8080",
    npsApiUrl: "http://nps-api:3001",
    adminUser: "admin",
    adminPass: "senha-secreta",
  },
}));

import Fastify, { FastifyInstance } from "fastify";
import { registerAuthRoutes } from "../routes/authRoutes";
import { tokenService } from "../services/TokenService";

describe("authRoutes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    registerAuthRoutes(app);
    await app.ready();
  });

  afterAll(() => app.close());

  // ─── POST /api/auth/login ──────────────────────────────────────────────

  describe("POST /api/auth/login", () => {
    it("deve retornar 200 com token para credenciais válidas", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { username: "admin", password: "senha-secreta" },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.token).toBeDefined();
      expect(body.tokenType).toBe("Bearer");
      expect(body.expiresIn).toBe("2h");
    });

    it("deve retornar 401 para senha incorreta", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { username: "admin", password: "errada" },
      });

      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.body);
      expect(body.error).toBe("Unauthorized");
    });

    it("deve retornar 401 para usuário incorreto", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { username: "hacker", password: "senha-secreta" },
      });

      expect(res.statusCode).toBe(401);
    });

    it("deve retornar 400 para body sem username", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { password: "senha-secreta" },
      });

      expect(res.statusCode).toBe(400);
    });

    it("deve gerar token verificável com o segredo correto", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { username: "admin", password: "senha-secreta" },
      });

      const { token } = JSON.parse(res.body);
      const payload = tokenService.verify(token);
      expect(payload.sub).toBe("admin");
      expect(payload.role).toBe("admin");
    });
  });

  // ─── POST /api/auth/refresh ────────────────────────────────────────────

  describe("POST /api/auth/refresh", () => {
    it("deve retornar 200 com novo token para token válido", async () => {
      const original = tokenService.sign({ sub: "admin", role: "admin" });

      const res = await app.inject({
        method: "POST",
        url: "/api/auth/refresh",
        headers: { authorization: `Bearer ${original}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.token).toBeDefined();
      expect(body.tokenType).toBe("Bearer");
    });

    it("deve retornar 401 sem Authorization header", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/refresh",
      });

      expect(res.statusCode).toBe(401);
    });

    it("deve retornar 401 para token inválido", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/refresh",
        headers: { authorization: "Bearer token.invalido.aqui" },
      });

      expect(res.statusCode).toBe(401);
    });
  });
});
