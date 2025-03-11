import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';

export const errorHandler = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    next: NextFunction
) =>
{
    console.error('Error:', err);

    let statusCode = 500;
    let message = 'Internal Server Error';
    let details = undefined;

    if ('statusCode' in err)
    {
        statusCode = err.statusCode;
        message = err.message || 'Something went wrong';
        details = err.details;
    } else if (err instanceof SyntaxError)
    {
        statusCode = 400;
        message = 'Invalid JSON';
    } else if (err instanceof Error)
    {
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(details && { details }),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) =>
{
    const error = new Error(`Not Found - ${req.originalUrl}`) as ApiError;
    error.statusCode = 404;
    next(error);
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
{
    Promise.resolve(fn(req, res, next)).catch(next);
};