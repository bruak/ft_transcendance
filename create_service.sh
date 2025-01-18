#!/bin/bash

# Kullanım doğrulama
if [ "$#" -ne 1 ]; then
    echo "Kullanım: $0 <dizin_yolu>"
    exit 1
fi

SERVICE=$1
COMPOSE="Project/docker-compose.yml"
PORT_BASE=8000
MAX_ATTEMPTS=100
SETTINGS="Project/${SERVICE}/srcs/${SERVICE}_service/settings.py"
SERVICE_DIR="./Project/${SERVICE}"
NEW_CONTENT="DATABASES = {\n    'default': {\n        'ENGINE': os.environ.get('DB_ENGINE', 'django.db.backends.sqlite3'),\n        'NAME': os.environ.get('POSTGRES_DB', 'db.sqlite3'),\n        'USER': os.environ.get('POSTGRES_USER', 'myuser'),\n        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'mypass'),\n        'HOST': os.environ.get('DB_HOST', 'localhost'),\n        'PORT': os.environ.get('DB_PORT', '5432'),\n    }"


# Kullanılmayan bir port bulma fonksiyonu
find_free_port() {
    local port=$PORT_BASE
    for ((i=0; i<MAX_ATTEMPTS; i++)); do
        if ! grep -q "$port:" "$COMPOSE" 2>/dev/null; then
            echo $port
            return 0
        fi
        ((port++))
    done
    echo "Hata: Kullanılabilir port bulunamadı." >&2
    exit 1
}

# Kullanılmayan port seçimi
FREE_PORT=$(find_free_port)

if [ -f "Project/Django/Dockerfile" ] && [ ! -d "Project/${SERVICE}" ]; then

# docker-compose.yml dosyasına hizmeti ekleme
cat << EOF >> $COMPOSE

  $SERVICE:
    build:
      context: ./$SERVICE 
    volumes:
      - ./$SERVICE/srcs:/app
    networks:
      - webnet
    ports:
      - "$FREE_PORT:8000"
    env_file:
      - .env
    depends_on:
      - ${SERVICE}_db
    environment:
      - DB_HOST=${SERVICE}_db
      - POSTGRES_DB=$SERVICE
 
  ${SERVICE}_db:
    image: postgres:13
    container_name: ${SERVICE}_db
    env_file:
      - .env
    networks:
      - webnet
    expose:
      - 5432
    environment:
      - POSTGRES_DB=$SERVICE
EOF

# Django projesi ve dizin yapısını oluşturma
    mkdir -p "${SERVICE_DIR}/srcs"
    django-admin startproject ${SERVICE}_service "${SERVICE_DIR}/srcs"
    django-admin startapp $SERVICE
    mv $SERVICE "${SERVICE_DIR}/srcs/"
    cp "Project/Django/Dockerfile" "${SERVICE_DIR}/"
    cp "Project/Django/srcs/entrypoint.py" "${SERVICE_DIR}/srcs"
    sed -i "s|user_service|${SERVICE}_service|g" "${SERVICE_DIR}/srcs/entrypoint.py"
    sed -i '/DATABASES = {/,/}/c\'"$NEW_CONTENT" $SETTINGS
    sed -i '14i\import os' $SETTINGS
    echo -e "Django>=3.2,<4.0\npsycopg2-binary>=2.8" > ${SERVICE_DIR}/requirements.txt
    echo "Yeni Django projesi $SERVICE oluşturuldu. Port: $FREE_PORT"
else
    echo "Hata: Gerekli dosya ve dizinler mevcut değil."
    exit 1
fi

