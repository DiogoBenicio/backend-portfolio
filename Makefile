.PHONY: dev prod cert-init down down-v logs ps

# Lê CERTBOT_EMAIL do .env se não estiver exportado no shell
CERTBOT_EMAIL ?= $(shell grep '^CERTBOT_EMAIL=' .env 2>/dev/null | cut -d= -f2 | tr -d '[:space:]')

# ─── Dev (HTTP, localhost) ────────────────────────────────────
dev:
	NGINX_CONF=nginx.dev.conf docker compose up --build -d

# ─── Prod (HTTPS, Let's Encrypt) ─────────────────────────────
prod:
	NGINX_CONF=nginx.prod.conf docker compose --profile prod up --build -d

# ─── Obter certificado pela 1ª vez (somente prod) ────────────
# Sobe nginx em modo HTTP para servir o ACME challenge, depois pede o cert.
# Após concluir, rode: make prod
cert-init:
	@test -n "$(CERTBOT_EMAIL)" || (echo "Erro: defina CERTBOT_EMAIL no .env ou como variável"; exit 1)
	NGINX_CONF=nginx.dev.conf docker compose up -d --no-deps nginx
	NGINX_CONF=nginx.dev.conf docker compose --profile prod run --rm certbot \
	  certonly --webroot -w /var/www/certbot \
	  --email $(CERTBOT_EMAIL) --agree-tos --no-eff-email \
	  -d diogoportifolio.opiniaolivre.com
	docker compose down

# ─── Utilitários ──────────────────────────────────────────────
down:
	docker compose down

down-v:
	docker compose down -v

logs:
	docker compose logs -f

ps:
	docker compose ps
