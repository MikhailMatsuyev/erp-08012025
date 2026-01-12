# ERP.AERO (MVP)

Backend-сервис для ERP-системы с REST API, контейнеризацией и MySQL.

## Стек

- **Node.js + TypeScript**
- **Express 5**
- **Prisma ORM**
- **MySQL 8**
- **Docker / Docker Compose**
- **JWT аутентификация**
- **bcrypt** (хэширование паролей)

## Что реализовано

- Docker-инфраструктура для API и MySQL
- Healthcheck:
    - `/health`
    - `/health/db`
- Prisma схема и миграции
- Автоматическое применение миграций (`prisma migrate deploy`)
- Подключение БД через `DATABASE_URL`
- Базовая структура проекта (API, scripts, Docker)
- Разделение env-файлов (`.env.docker`)

## Запуск в Docker (dev)


docker compose up -d
docker compose exec api npm run migrate:docker
После этого API доступно на http://localhost:3000.

## Проверка


curl http://localhost:3000/health
curl http://localhost:3000/health/db

## Примечания
.env.docker используется через env_file в docker-compose.yml

Миграции не коммитятся вручную в БД — только через Prisma




