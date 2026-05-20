-- Cria tabela NpsResponse (mesma DDL da migration Prisma 20260520013456_init)
-- e marca a migration como já aplicada para o Prisma não tentar recriá-la.
-- Também insere 20 respostas NPS de exemplo (idempotente via ON CONFLICT DO NOTHING).

-- ─── Tabela ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "NpsResponse" (
    "id"        TEXT          NOT NULL,
    "score"     INTEGER       NOT NULL,
    "comment"   TEXT,
    "name"      TEXT,
    "page"      TEXT          NOT NULL DEFAULT 'portfolio',
    "createdAt" TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)  NOT NULL,
    CONSTRAINT "NpsResponse_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "NpsResponse_page_idx"      ON "NpsResponse"("page");
CREATE INDEX IF NOT EXISTS "NpsResponse_score_idx"     ON "NpsResponse"("score");
CREATE INDEX IF NOT EXISTS "NpsResponse_createdAt_idx" ON "NpsResponse"("createdAt");

-- ─── Registro da migration Prisma ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                  VARCHAR(36)  PRIMARY KEY NOT NULL,
    "checksum"            VARCHAR(64)  NOT NULL,
    "finished_at"         TIMESTAMPTZ,
    "migration_name"      VARCHAR(255) NOT NULL,
    "logs"                TEXT,
    "rolled_back_at"      TIMESTAMPTZ,
    "started_at"          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER      NOT NULL DEFAULT 0
);

INSERT INTO "_prisma_migrations"
    (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
SELECT
    gen_random_uuid()::text,
    '25a190e995edb521d183eb7fe7156219ccc5d699b354c817abf27e951536abad',
    now(),
    '20260520013456_init',
    NULL,
    NULL,
    now(),
    1
WHERE NOT EXISTS (
    SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20260520013456_init'
);

-- ─── Seed de respostas NPS ───────────────────────────────────────────────────
-- WHERE NOT EXISTS garante idempotência mesmo rodando múltiplas vezes
INSERT INTO "NpsResponse" (id, score, comment, page, "createdAt", "updatedAt")
SELECT id, score, comment, page, "createdAt", "updatedAt" FROM (VALUES
  (gen_random_uuid()::text, 10, 'Arquitetura muito bem pensada, hexagonal de verdade!',      'portfolio', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (gen_random_uuid()::text, 10, 'JWT + rate limit bem implementados no gateway.',             'portfolio', NOW() - INTERVAL '27 days', NOW() - INTERVAL '27 days'),
  (gen_random_uuid()::text,  9, 'Stack moderna e código limpo.',                              'portfolio', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
  (gen_random_uuid()::text,  9, 'Gostei muito da parte de sensores meteorológicos.',          'portfolio', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),
  (gen_random_uuid()::text, 10, 'Deploy containerizado impecável.',                           'portfolio', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  (gen_random_uuid()::text,  9, 'Dashboard bem estruturado, dados em tempo real.',            'portfolio', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
  (gen_random_uuid()::text, 10, 'Boa separação de responsabilidades entre os serviços.',      'portfolio', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  (gen_random_uuid()::text,  8, 'Poderia ter mais endpoints documentados.',                   'portfolio', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days'),
  (gen_random_uuid()::text,  9, 'Spring Boot + Java 21 bem configurados.',                   'portfolio', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days'),
  (gen_random_uuid()::text, 10, 'Testes unitários e de integração bem cobertos.',             'portfolio', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  (gen_random_uuid()::text,  8, 'Frontend responsivo, boa UX.',                               'portfolio', NOW() - INTERVAL '8 days',  NOW() - INTERVAL  '8 days'),
  (gen_random_uuid()::text,  7, 'Boa estrutura, faltou um pouco mais de documentação.',       'portfolio', NOW() - INTERVAL '7 days',  NOW() - INTERVAL  '7 days'),
  (gen_random_uuid()::text, 10, 'Excelente uso de TanStack Query no frontend.',               'portfolio', NOW() - INTERVAL '6 days',  NOW() - INTERVAL  '6 days'),
  (gen_random_uuid()::text,  9, 'Nginx como único ponto de entrada é uma boa decisão.',       'portfolio', NOW() - INTERVAL '5 days',  NOW() - INTERVAL  '5 days'),
  (gen_random_uuid()::text,  6, 'Poderia ter mais exemplos de uso da API.',                   'portfolio', NOW() - INTERVAL '4 days',  NOW() - INTERVAL  '4 days'),
  (gen_random_uuid()::text, 10, 'Prisma + PostgreSQL bem integrados na NPS API.',             'portfolio', NOW() - INTERVAL '3 days',  NOW() - INTERVAL  '3 days'),
  (gen_random_uuid()::text,  8, 'Código organizado e fácil de entender.',                     'portfolio', NOW() - INTERVAL '2 days',  NOW() - INTERVAL  '2 days'),
  (gen_random_uuid()::text,  9, 'Segurança bem pensada com os headers no Nginx.',             'portfolio', NOW() - INTERVAL '1 day',   NOW() - INTERVAL  '1 day'),
  (gen_random_uuid()::text,  5, 'Interessante, mas poderia ter mais projetos.',               'portfolio', NOW() - INTERVAL '12 hours',NOW() - INTERVAL '12 hours'),
  (gen_random_uuid()::text, 10, 'Impressionante para um portfólio pessoal!',                  'portfolio', NOW() - INTERVAL '1 hour',  NOW() - INTERVAL  '1 hour')
) AS v(id, score, comment, page, "createdAt", "updatedAt")
WHERE NOT EXISTS (SELECT 1 FROM "NpsResponse" LIMIT 1);
