# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Устанавливаем все зависимости (включая dev)
COPY package*.json ./
RUN npm ci

# Копируем исходники и собираем TS
COPY tsconfig.json ./
COPY src ./src
RUN npm run build


# ---------- Stage 2: Runtime ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache mysql-client

# Создаём non-root пользователя
RUN addgroup -S app && adduser -S app -G app

# Устанавливаем только production-зависимости
COPY package*.json ./
RUN npm ci --omit=dev

# Копируем скомпилированный код
COPY --from=builder /app/dist ./dist

# Копируем scripts
COPY scripts /scripts
RUN chmod +x /scripts/wait-for-db.sh

# Меняем пользователя
USER app

EXPOSE 3000

CMD ["sh", "-c", "/scripts/wait-for-db.sh && node dist/app.js"]
