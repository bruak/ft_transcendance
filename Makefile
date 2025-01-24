COMPOSE_DIR := ./Project

all: up

up:
	@echo "Başlatılıyor..."
	docker compose -f $(COMPOSE_DIR)/docker-compose.yml up --build

start:
	@echo "Başlatılıyor..."
	docker compose -f $(COMPOSE_DIR)/docker-compose.yml start

down:
	@echo "Durduruluyor..."
	docker compose -f $(COMPOSE_DIR)/docker-compose.yml down

stop:
	@echo "Durduruluyor..."
	docker compose -f $(COMPOSE_DIR)/docker-compose.yml stop

restart: down up

build:
	@echo "Yeniden oluşturuluyor..."
	docker compose -f $(COMPOSE_DIR)/docker-compose.yml build

clean:
	@echo "Geçici dosyalar temizleniyor..."
	docker compose -f $(COMPOSE_DIR)/docker-compose.yml down --volumes --remove-orphans

fclean: clean
	@echo "Konteynerler ve imajlar tamamen temizleniyor..."
	docker compose -f $(COMPOSE_DIR)/docker-compose.yml down --rmi all --volumes --remove-orphans

re: fclean all

logs:
	docker compose -f $(COMPOSE_DIR)/docker-compose.yml logs -f

f:
	docker builder prune -a --force
	docker system prune -a --volumes --force
	docker volume prune --all --force

.PHONY: all up down restart build clean fclean re