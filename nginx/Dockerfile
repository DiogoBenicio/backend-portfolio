FROM nginx:1.27-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.dev.conf nginx.prod.conf /etc/nginx/

ARG NGINX_CONF=nginx.dev.conf
RUN rm -f /etc/nginx/nginx.conf && \
    ln -s /etc/nginx/${NGINX_CONF} /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
