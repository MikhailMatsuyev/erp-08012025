# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Устанавливаем зависимости
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

# Создаём non-root пользователя
RUN addgroup -S app && adduser -S app -G app

# Копируем только production-зависимости
COPY package*.json ./
RUN npm ci --omit=dev

# Копируем скомпилированный код
COPY --from=builder /app/dist ./dist

# Меняем пользователя
USER app

EXPOSE 3000

CMD ["node", "dist/app.js"]


