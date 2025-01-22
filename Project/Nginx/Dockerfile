FROM alpine:3.20.3

RUN apk update && apk add --no-cache nginx openssl bash

RUN mkdir -p /run/nginx/html

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./entrypoint.sh /tmp/entrypoint.sh

RUN chmod +x /tmp/entrypoint.sh

EXPOSE 443

ENTRYPOINT [ "/tmp/entrypoint.sh" ]

CMD ["nginx", "-g", "daemon off;"]
