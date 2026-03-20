FROM nginx:1.27-alpine

# Remove configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf

# Teste de configuração no build
RUN nginx -t

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
