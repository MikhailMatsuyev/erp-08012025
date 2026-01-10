import express, { Express, Request, Response } from 'express';
import { errorHandler } from "./middlewares/error.middleware";
import { prisma } from './db/prisma';
import { prismaErrorMiddleware } from "./middlewares/prisma-error.middleware";

const app: Express = express();
const PORT = Number(process.env.PORT) || 3000;

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

// HANDLER ошибок БД
app.use(prismaErrorMiddleware);

// ГЛОБАЛЬНЫЙ HANDLER — ВСЕГДА ПОСЛЕДНИМ
app.use(errorHandler);

let server: any;

server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);

    if (server) {
        server.close(() => {
            console.log('HTTP server closed');
        });
    }

    try {
        await prisma.$disconnect();
        console.log('Prisma disconnected');
    } catch (err) {
        console.error('Error disconnecting Prisma', err);
    }

    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
