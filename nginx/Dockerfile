FROM nginx:1.27-alpine

# Remove configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf

# No build-time check to avoid upstream DNS dependency. Runtime healthchecks will validar.

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
