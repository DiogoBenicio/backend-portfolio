# Nginx — Arquitetura

## Função

Reverse proxy de entrada — único ponto de acesso externo do ecossistema. Recebe todo o tráfego nas portas 80/443 e distribui para os serviços internos via rede Docker.

## Stack
- **Nginx 1.27-alpine**
- Portas expostas: **80** (HTTP → redirect) e **443** (HTTPS em produção)
- Certificados TLS via **Let's Encrypt** (certbot, renovação automática)

## Roteamento

| Prefixo | Destino interno | Descrição |
|---|---|---|
| `/api/*` | `gateway-api:4000` | Todas as chamadas de API |
| `/*` | Frontend (static files) | Aplicação Next.js (export estático) |

## Configurações

- **Dev** (`nginx.dev.conf`): HTTP puro, porta 80, arquivos estáticos do build Next.js
- **Prod** (`nginx.prod.conf`): HTTPS com TLS 1.2/1.3, redirect 80→443, CSP headers

## Por que Nginx à frente dos serviços?

- Centraliza o ponto de entrada (1 porta exposta externamente)
- TLS/HTTPS sem alterar os serviços internos
- Headers de proxy (`X-Forwarded-For`) repassados corretamente ao Gateway para rate limit por IP real
- Serve o frontend como export estático (sem Node.js em produção)
- Content Security Policy centralizada

## Rede Docker

Todos os serviços compartilham a rede interna `portfolio-network`. O Nginx é o único container com portas mapeadas para o host.
