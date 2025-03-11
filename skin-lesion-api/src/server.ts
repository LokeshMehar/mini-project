import app from './app';
import config from './config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Start server
const server = app.listen(config.port, () =>
{
    console.log(`Server running in ${config.env} mode on port ${config.port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) =>
{
    console.error('UNHANDLED REJECTION! Shutting down...', err.name, err.message);
    console.error(err.stack);

    // Close server & exit process
    server.close(() =>
    {
        process.exit(1);
    });
});

// Handle SIGTERM signal
process.on('SIGTERM', () =>
{
    console.log('SIGTERM received. Shutting down gracefully...');

    // Close Prisma client
    prisma.$disconnect().then(() =>
    {
        console.log('Prisma client disconnected');

        // Close server
        server.close(() =>
        {
            console.log('Process terminated');
        });
    });
});

export default server;