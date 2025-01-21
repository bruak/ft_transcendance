FROM alpine:3.20.3

RUN apk update && apk add --no-cache nginx openssl bash

RUN mkdir -p /run/nginx/html

COPY ./nginx.conf /etc/nginx/nginx.conf


EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]
