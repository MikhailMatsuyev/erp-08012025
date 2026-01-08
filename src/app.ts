import express, { Request, Response } from 'express';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

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

const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);

    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Forced shutdown');
        process.exit(1);
    }, 10_000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
