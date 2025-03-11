import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import config from '../config';
import { ImageProcessingOptions } from '../types';

export class ImageProcessingService
{

    /**
     * Process an image for ML model input
     * @param filePath Path to the uploaded image file
     * @param options Processing options
     * @returns Path to the processed image
     */
    async processImage(filePath: string, options: ImageProcessingOptions = {}): Promise<Buffer>
    {
        try
        {
            const {
                resize = true,
                width = config.imageProcessing.targetSize,
                height = config.imageProcessing.targetSize,
                normalize = true,
                enhanceContrast = false,
                detectEdges = false
            } = options;

            let imageProcessor = sharp(filePath);

            // Resize the image if requested
            if (resize)
            {
                imageProcessor = imageProcessor.resize(width, height, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 1 }
                });
            }

            // Apply contrast enhancement if requested
            if (enhanceContrast)
            {
                imageProcessor = imageProcessor.normalize().gamma(1.2).modulate({
                    brightness: 1.05,
                });
            } else if (normalize)
            {
                // Just normalize if requested
                imageProcessor = imageProcessor.normalize();
            }

            // Apply edge detection if requested
            if (detectEdges)
            {
                imageProcessor = imageProcessor.sharpen({
                    sigma: 1.5,
                    m1: 1,
                    m2: 2
                });
            }

            // Convert to the required format
            imageProcessor = imageProcessor.toFormat('jpeg', { quality: config.imageProcessing.quality });

            // Process the image and return the buffer
            return await imageProcessor.toBuffer();
        } catch (error)
        {
            console.error('Error processing image:', error);
            throw new Error('Failed to process image');
        }
    }

    /**
     * Save a processed image to disk
     * @param imageBuffer The processed image buffer
     * @param originalFilename The original filename
     * @returns Path to the saved image
     */
    async saveProcessedImage(imageBuffer: Buffer, originalFilename: string): Promise<string>
    {
        const filename = path.basename(originalFilename, path.extname(originalFilename));
        const processedFilename = `${filename}_processed.jpg`;
        const outputPath = path.join(config.uploadDir, processedFilename);

        await fs.promises.writeFile(outputPath, imageBuffer);
        return outputPath;
    }
}

export default new ImageProcessingService();