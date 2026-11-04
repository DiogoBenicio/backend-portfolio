#!/bin/sh
# Força renovação imediata do certificado Let's Encrypt + reload do nginx.
#
# NOTA: a renovação já é automática — o certbot roda `certbot renew` a cada 12h
# e o nginx recarrega a si mesmo a cada 6h (ver nginx/docker-entrypoint.sh),
# aplicando qualquer cert renovado sem intervenção. Este script é apenas um
# fallback para disparar renovação + reload na hora (ex.: troubleshooting).
#
# Uso: ./scripts/renew-cert.sh
#   (execute a partir da raiz do projeto onde está o docker-compose.yml)

set -e

echo "[renew-cert] Renovando certificados via certbot..."
docker compose --profile prod exec certbot certbot renew --quiet

echo "[renew-cert] Recarregando nginx para aplicar novos certificados..."
docker compose --profile prod exec nginx nginx -s reload

echo "[renew-cert] Certificado renovado e nginx recarregado com sucesso."
