Декомпозиция проекта (Docker-first)
🧱 EPIC 0 — Инфраструктура (делаем СРАЗУ)

❗ Важно: Docker добавляется в самом начале, не в конце.

0.1 Docker-first подход

Проект сразу запускается через Docker

Нет «локального» режима без контейнеров

Любой разработчик / проверяющий:

docker compose up


и всё работает

🐳 EPIC 1 — Docker & окружение
1.1 Dockerfile (Node.js)

✔ Multi-stage build
✔ node:20-alpine
✔ Non-root user (app)
✔ Production dependencies (npm ci --omit=dev)
✔ TS build (dist/)
✔ EXPOSE 3000
✔ NODE_ENV=production

1.2 docker-compose.yml

✔ Сервисы:

 api — Express + TS

 mysql — MySQL 8

✔ Volumes:

mysql_data ✅
(uploads пока логически заложен, но физически ещё не используем — это нормально)

✔ .env подключается через env_file

✔ depends_on: condition: service_healthy — ВАЖНО

✔ Restart policy (unless-stopped)

1.3 Wait-for-DB (🔥 важный момент)

✔ Docker healthcheck у MySQL
✔ depends_on: condition: service_healthy
✔ Реальная проверка SELECT 1
✔ Убрали race condition
✔ Убрали костыль в entrypoint

1.4 Healthcheck
✔ /health endpoint есть
✔ Docker healthcheck у MySQL есть
❌ /health/db — пока нет
❌ Docker HEALTHCHECK для API — пока нет
❌ убрать wait-for-db полностью
❌ добавить /health/db
❌ перейти к Prisma / TypeORM

1.5 Graceful shutdown
Обработка:

SIGTERM

SIGINT

Закрытие:

HTTP server

MySQL pool

Логи:

Server shutting down...

🧠 EPIC 2 — Архитектура Express приложения
2.1 Структура проекта
src/
├── app.ts
├── server.js
├── config/
│    ├── db.js
│    └── jwt.js
├── routes/
├── controllers/
├── services/
├── middlewares/
├── models/
├── utils/
└── uploads/ (volume)

2.2 CORS

Разрешить доступ с любого домена

credentials: true

🔐 EPIC 3 — Аутентификация и JWT

(как мы обсуждали ранее, но фиксируем)

Access token — 10 минут

Refresh token — в БД

Multi-device

Logout → revoke один refresh

Старые токены не работают

📁 EPIC 4 — File API

Upload / Download

List с пагинацией

Update

Delete

Проверка владельца файла

🧪 EPIC 5 — Надёжность и безопасность
5.1 Валидация

входные данные

размеры файлов

5.2 Ошибки

единый error handler

HTTP коды

человекочитаемые сообщения

📄 EPIC 6 — README (🔥 обязательно)
6.1 README.md должен содержать:
📦 Описание

Что это за сервис

Основной стек

🚀 Запуск локально
docker compose up --build

🖥 Запуск на сервере

требования:

Docker

Docker Compose

команды

открытые порты

🔐 Переменные окружения
DB_HOST=
DB_USER=
DB_PASSWORD=
JWT_SECRET=
JWT_REFRESH_SECRET=

📡 API Endpoints

/signup

/signin

/signin/new_token

/file/*

/info

/logout

🧹 EPIC 7 — .gitignore (ты просил — показываю)
.gitignore (Node + Docker + uploads)
# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Env
.env
.env.local
.env.production

# Docker
*.log

# MySQL
mysql-data/

# Uploads (runtime data)
uploads/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

🎯 Почему это реально «вау» для работодателя

Ты показываешь, что:

думаешь как прод-инженер

понимаешь lifecycle приложения

знаешь Docker не поверхностно

умеешь делать безопасный auth

работаешь с файлами корректно

Это уровень strong middle / middle+, а не «junior REST».

Как предлагаю идти дальше (очень конкретно)

👉 Шаг 1:
Спроектируем docker-compose.yml + Dockerfile (я напишу их полностью)

👉 Шаг 2:
Поднимем пустой Express + /health

👉 Шаг 3:
Подключим MySQL + wait-for-db

👉 Шаг 4:
Auth
