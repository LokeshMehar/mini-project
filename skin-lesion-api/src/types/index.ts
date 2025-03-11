export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AnalysisRequest
{
    image: Express.Multer.File;
    settings?: {
        enhanceContrast?: boolean;
        detectEdges?: boolean;
        [key: string]: any;
    };
}

export interface AnalysisResponse
{
    jobId: string;
    status: AnalysisStatus;
    estimatedTime?: number;
}

export interface ResultsResponse
{
    jobId: string;
    status: AnalysisStatus;
    diagnosis?: string;
    confidence?: number;
    possibleConditions?: Array<{
        name: string;
        probability: number;
    }>;
    recommendations?: string;
    createdAt: Date;
    processedAt?: Date;
}

export interface ImageProcessingOptions
{
    resize?: boolean;
    width?: number;
    height?: number;
    normalize?: boolean;
    enhanceContrast?: boolean;
    detectEdges?: boolean;
}

export interface ApiError extends Error
{
    statusCode: number;
    details?: any;
}