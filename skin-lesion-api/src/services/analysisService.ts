import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import imageProcessingService from './imageProcessingService';
import mlService from './mlService';
import { AnalysisStatus, ResultsResponse } from '../types';
import fs from 'fs';

const prisma = new PrismaClient();

class AnalysisService
{
    /**
     * Create a new analysis job
     * @param imagePath Path to the uploaded image
     * @returns Job ID and status
     */
    async createAnalysis(imagePath: string): Promise<{ jobId: string; status: AnalysisStatus }>
    {
        try
        {
            const analysis = await prisma.analysis.create({
                data: {
                    id: uuidv4(),
                    imagePath,
                    status: 'pending'
                }
            });

            // Process the analysis asynchronously
            this.processAnalysisAsync(analysis.id, imagePath);

            return {
                jobId: analysis.id,
                status: 'pending'
            };
        } catch (error)
        {
            console.error('Error creating analysis:', error);
            throw new Error('Failed to create analysis');
        }
    }

    /**
     * Process the image and run ML prediction asynchronously
     * Note: In a real implementation, this might use a job queue
     * @param jobId The analysis job ID
     * @param imagePath Path to the image file
     */
    private async processAnalysisAsync(jobId: string, imagePath: string): Promise<void>
    {
        try
        {
            // Update status to processing
            await prisma.analysis.update({
                where: { id: jobId },
                data: { status: 'processing' }
            });

            // Process the image
            const processedImageBuffer = await imageProcessingService.processImage(imagePath);

            // Run ML model if available, otherwise use simulated results
            let results;
            if (mlService.isModelReady())
            {
                // Use TensorFlow model for prediction
                results = await mlService.predict(processedImageBuffer);
            } else
            {
                // Fall back to simulated results
                console.log('ML model not available, using simulated results');
                results = this.simulateMlResults();
            }

            // Update the analysis with results
            await prisma.analysis.update({
                where: { id: jobId },
                data: {
                    status: 'completed',
                    diagnosisResult: results.diagnosis,
                    confidence: results.confidence,
                    possibleConditions: results.possibleConditions,
                    recommendations: results.recommendations,
                    result: results
                }
            });
        } catch (error)
        {
            console.error('Error processing analysis:', error);

            // Update status to failed
            await prisma.analysis.update({
                where: { id: jobId },
                data: {
                    status: 'failed',
                    result: { error: 'Processing failed', message: error instanceof Error ? error.message : 'Unknown error' }
                }
            });
        }
    }

    /**
     * Get the status of an analysis job
     * @param jobId The analysis job ID
     * @returns Current status
     */
    async getAnalysisStatus(jobId: string): Promise<{ jobId: string; status: AnalysisStatus; estimatedTime?: number }>
    {
        try
        {
            const analysis = await prisma.analysis.findUnique({
                where: { id: jobId }
            });

            if (!analysis)
            {
                throw new Error('Analysis not found');
            }

            let estimatedTime: number | undefined;
            if (analysis.status === 'processing')
            {
                // Estimate time based on model availability
                estimatedTime = mlService.isModelReady() ? 10 : 5;
            }

            return {
                jobId,
                status: analysis.status as AnalysisStatus,
                estimatedTime
            };
        } catch (error)
        {
            console.error('Error getting analysis status:', error);
            throw new Error('Failed to get analysis status');
        }
    }

    /**
     * Get the results of a completed analysis
     * @param jobId The analysis job ID
     * @returns Analysis results
     */
    async getAnalysisResults(jobId: string): Promise<ResultsResponse>
    {
        try
        {
            const analysis = await prisma.analysis.findUnique({
                where: { id: jobId }
            });

            if (!analysis)
            {
                throw new Error('Analysis not found');
            }

            if (analysis.status !== 'completed')
            {
                return {
                    jobId,
                    status: analysis.status as AnalysisStatus,
                    createdAt: analysis.createdAt
                };
            }

            let possibleConditions: Array<{ name: string; probability: number }> | undefined;

            if (analysis.possibleConditions)
            {
                possibleConditions = analysis.possibleConditions as any;
            }

            return {
                jobId,
                status: analysis.status as AnalysisStatus,
                diagnosis: analysis.diagnosisResult || undefined,
                confidence: analysis.confidence || undefined,
                possibleConditions,
                recommendations: analysis.recommendations || undefined,
                createdAt: analysis.createdAt,
                processedAt: analysis.updatedAt
            };
        } catch (error)
        {
            console.error('Error getting analysis results:', error);
            throw new Error('Failed to get analysis results');
        }
    }

    /**
     * Simulate ML model results for testing
     * @returns Simulated diagnosis results
     */

}

export default new AnalysisService();