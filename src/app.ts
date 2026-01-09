import express, { Request, Response } from 'express';
import { pool } from './db/mysql';

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

async function checkDatabaseConnection() {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('MySQL connection established');
}

let server: any;

(async () => {
    try {
        await checkDatabaseConnection();

        server = app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
})();

// Graceful shutdown
const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);

    if (server) {
        server.close(() => {
            console.log('HTTP server closed');
        });
    }

    try {
        await pool.end();
        console.log('MySQL pool closed');
    } catch (err) {
        console.error('Error closing MySQL pool', err);
    }

    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
