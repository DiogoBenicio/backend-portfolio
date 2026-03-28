# Nginx — Arquitetura

## Função

Reverse proxy de entrada — único ponto de acesso externo do ecossistema. Recebe todo o tráfego na porta 80 e distribui para os serviços internos via rede Docker.

## Stack
- **Nginx** (imagem oficial Alpine)
- Porta exposta: **80**

## Roteamento

| Prefixo | Destino interno | Descrição |
|---|---|---|
| `/api/*` | `gateway-api:3000` | Todas as chamadas de API |
| `/*` | `frontend:3000` | Aplicação Next.js (SSR + assets) |

## Configuração (`nginx.conf`)

```nginx
upstream frontend  { server frontend:3000; }
upstream gateway   { server gateway-api:3000; }

server {
    listen 80;

    location /api/ {
        proxy_pass http://gateway;
    }

    location / {
        proxy_pass http://frontend;
    }
}
```

## Por que Nginx à frente do Next.js?

- Centraliza o ponto de entrada (1 porta exposta)
- Permite adicionar TLS/HTTPS sem alterar os serviços
- Headers de proxy (`X-Forwarded-For`) repassados corretamente ao Gateway para rate limit por IP real
- Facilita cache de assets estáticos em produção

## Rede Docker

Todos os serviços compartilham a rede interna `portfolio-network`. O Nginx é o único container com porta mapeada para o host.
