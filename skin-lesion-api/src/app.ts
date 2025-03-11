import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import routes from './routes';
import config from './config';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

// Create Express app
const app: Express = express();

// Set security headers
app.use(helmet());

// Enable CORS
app.use(cors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.env !== 'test')
{
    app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', config.uploadDir)));

// API Routes
app.use(routes);

// Health check endpoint
app.get('/health', (req, res) =>
{
    res.status(200).json({ status: 'ok', environment: config.env });
});

// 404 handler
app.use(notFoundHandler);

// Error handler middleware
app.use(errorHandler);

export default app;