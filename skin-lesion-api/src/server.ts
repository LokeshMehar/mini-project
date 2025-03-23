import app from './app';
import config from './config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Start server
const server = app.listen(config.port, async () =>
{
    console.log(`Server running in ${config.env} mode on port ${config.port}`);

    // Ensure ML model is initialized
    // try
    // {
    //     if (mlService.isModelReady())
    //     {
    //         console.log('ML model is ready for predictions');
    //     } else
    //     {
    //         console.log('ML model is not available, the server will use simulated results');
    //         console.log('Run "npm run download-model" to download a pre-trained model');
    //     }
    // } catch (error)
    // {
    //     console.error('Error initializing ML model:', error);
    // }
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