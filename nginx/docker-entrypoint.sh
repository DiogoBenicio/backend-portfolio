#!/bin/sh
set -e

# Renderiza o config substituindo APENAS ${DOMAIN}.
# A whitelist '${DOMAIN}' é CRÍTICA: sem ela o envsubst apagaria
# as variáveis de runtime do nginx ($host, $uri, $remote_addr, etc).
envsubst '${DOMAIN}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Falha rápido se o config ficou inválido (ex.: DOMAIN vazio em prod).
nginx -t

# Loop de reload em background: aplica certs renovados a cada 6h.
# Elimina a necessidade de reload manual após a renovação do certbot.
( while :; do sleep 21600 & wait $!; nginx -s reload; done ) &

exec nginx -g 'daemon off;'
