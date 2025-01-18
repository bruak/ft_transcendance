#!/bin/bash

# Kullanım doğrulama
if [ "$#" -ne 1 ]; then
    echo "Kullanım: $0 <dizin_yolu>"
    exit 1
fi

SERVICE=$1
LOWSERVICE=$(echo $SERVICE | tr '[:upper:]' '[:lower:]')
UPSERVICE=$(echo "${LOWSERVICE:0:1}" | tr '[:lower:]' '[:upper:]')${LOWSERVICE:1}

COMPOSE="Project/docker-compose.yml"
PORT_BASE=8000
MAX_ATTEMPTS=100
SERVICE_DIR="./Project/${UPSERVICE}"
SETTINGS="${SERVICE_DIR}/srcs/${SERVICE}_service/settings.py"
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
if ! grep -q "$LOWSERVICE:" "$COMPOSE" 2>/dev/null; then
  
cat << EOF >> $COMPOSE

  $LOWSERVICE:
    build:
      context: ./$UPSERVICE 
    volumes:
      - ./$UPSERVICE/srcs:/app
    networks:
      - webnet
    ports:
      - "$FREE_PORT:8000"
    env_file:
      - .env
    depends_on:
      - ${LOWSERVICE}_db
    environment:
      - DB_HOST=${LOWSERVICE}_db
      - POSTGRES_DB=$LOWSERVICE
 
  ${LOWSERVICE}_db:
    image: postgres:13
    container_name: ${LOWSERVICE}_db
    env_file:
      - .env
    networks:
      - webnet
    expose:
      - 5432
    environment:
      - POSTGRES_DB=$LOWSERVICE
EOF
fi
  APP="    '$LOWSERVICE',"
# Django projesi ve dizin yapısını oluşturma
    mkdir -p "${SERVICE_DIR}/srcs"
    django-admin startproject ${LOWSERVICE}_service "${SERVICE_DIR}/srcs"
    django-admin startapp $LOWSERVICE
    mv $LOWSERVICE "${SERVICE_DIR}/srcs/"
    cp "Project/Django/Dockerfile" "${SERVICE_DIR}/"
    cp "Project/Django/srcs/entrypoint.py" "${SERVICE_DIR}/srcs"
    sed -i "s|user_service|${LOWSERVICE}_service|g" "${SERVICE_DIR}/srcs/entrypoint.py"
    sed -i '/DATABASES = {/,/}/c\'"$NEW_CONTENT" $SETTINGS
    sed -i '14i\import os' $SETTINGS
    sed "41i $(printf '%s' "${APP}")" "$SETTINGS" > temp && mv temp "$SETTINGS"
    echo -e "Django>=3.2,<4.0\npsycopg2-binary>=2.8" > ${SERVICE_DIR}/requirements.txt
    echo "Yeni Django projesi $LOWSERVICE oluşturuldu. Port: $FREE_PORT"
else
    echo "Hata: Gerekli dosya ve dizinler mevcut değil."
    exit 1
fi

