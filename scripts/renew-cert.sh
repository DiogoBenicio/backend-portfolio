#!/bin/sh
# Renova certificados Let's Encrypt e recarrega o nginx.
# Executar manualmente após a renovação automática do certbot não ter disparado reload.
#
# Uso: ./scripts/renew-cert.sh
#   (execute a partir da raiz do projeto onde está o docker-compose.yml)

set -e

echo "[renew-cert] Renovando certificados via certbot..."
docker compose --profile prod exec certbot certbot renew --quiet

echo "[renew-cert] Recarregando nginx para aplicar novos certificados..."
docker compose --profile prod exec nginx nginx -s reload

echo "[renew-cert] Certificado renovado e nginx recarregado com sucesso."
