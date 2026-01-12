import express, { Express, Request, Response } from 'express';
import { errorHandler } from "./middlewares/error.middleware";
import { prisma } from './db/prisma';
import { prismaErrorMiddleware } from "./middlewares/prisma-error.middleware";
import authRoutes from "./routes/auth.routes";
import fileRoutes from "./routes/file.routes";
import { corsMiddleware } from "./middlewares/cors.middleware";

const app: Express = express();
const PORT = Number(process.env.PORT) || 3000;
let isShuttingDown = false;

// Middleware
app.use(express.json());

// Healthcheck
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req: Request, res: Response) => {
  process.stdout.write('\x07'); // BELL character
  res.send('API is running');
});


app.get('/health/db', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database healthcheck failed:', error);

    res.status(503).json({
      status: 'error',
      database: 'unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

app.get('/__test/error', () => {
  throw new Error('boom - checking Global Error Handler OK');
});

app.get('/__test/prisma-error', async (_req, _res, next) => {
  try {
    await prisma.$queryRawUnsafe('SELECT * FROM table_that_does_not_exist');
  } catch (e) {
    next(e);
  }
});


app.use(corsMiddleware);

app.use('/file', fileRoutes);
app.use('/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// HANDLER ошибок БД
app.use(prismaErrorMiddleware);

// ГЛОБАЛЬНЫЙ HANDLER — ВСЕГДА ПОСЛЕДНИМ
app.use(errorHandler);

let server: any;

server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Graceful shutdown
async function shutdown(signal: string) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Server shutting down... (${signal})`);

  server.close(async (err?: Error) => {
    if (err) {
      console.error('Error closing HTTP server', err);
      process.exit(1);
    }

    try {
      await prisma.$disconnect();
      console.log('MySQL pool closed');
    } catch (e) {
      console.error('Error disconnecting Prisma', e);
    } finally {
      process.exit(0);
    }
  });
}

// Подписываемся на сигналы остановки Docker, чтобы
// корректно остановить приложение, призму, сервер
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
