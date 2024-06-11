FROM nginx:latest

COPY nginx.conf /etc/nginx/nginx.conf

VOLUME /certificates

EXPOSE 443/tcp

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
