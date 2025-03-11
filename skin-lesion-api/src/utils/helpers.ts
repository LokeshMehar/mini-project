/**
 * Format error response
 * @param message Error message
 * @param statusCode HTTP status code
 * @param details Additional error details
 * @returns Formatted error object
 */
export const createError = (message: string, statusCode = 500, details?: any) =>
{
    const error = new Error(message) as any;
    error.statusCode = statusCode;
    if (details)
    {
        error.details = details;
    }
    return error;
};

/**
 * Validate a UUID string
 * @param uuid String to validate
 * @returns Boolean indicating if string is a valid UUID
 */
export const isValidUUID = (uuid: string): boolean =>
{
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

/**
 * Clean filename for storage
 * @param filename Original filename
 * @returns Sanitized filename
 */
export const sanitizeFilename = (filename: string): string =>
{
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_');
};