#!/bin/sh
mkdir -p /etc/ssl/private
sed -i "s|!DOMAIN!|$IP_ADDR|g" /etc/nginx/nginx.conf

if [ -f "/etc/ssl/private/nginx.key" ] && [ -f "/etc/ssl/private/ngnix.crt" ]; then
    echo "SSL sertificate is already created!"
    exec "$@"
fi

openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
    -keyout /etc/ssl/private/nginx.key \
    -out /etc/ssl/private/ngnix.crt \
    -subj "/C=TR/ST=Istanbul/L=Istanbul/O=Development/OU=IT/CN=localhost"

echo "SSL sertificate is created!"

exec "$@"