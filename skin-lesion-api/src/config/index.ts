import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/skin_lesion_db?schema=public',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    imageProcessing: {
        targetSize: 224, // Standard size for many ML models
        quality: 90
    }
};

// Ensure upload directory exists
import fs from 'fs';
if (!fs.existsSync(config.uploadDir))
{
    fs.mkdirSync(config.uploadDir, { recursive: true });
}

export default config;