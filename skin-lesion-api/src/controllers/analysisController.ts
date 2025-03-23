// import { Request, Response } from 'express';
// import { asyncHandler } from '../middlewares/errorHandler';
// // import analysisService from '../services/analysisService';
// import { ApiError } from '../types';

// export const uploadAndAnalyze = asyncHandler(async (req: Request, res: Response) =>
// {
//     // Check if file exists
//     if (!req.file)
//     {
//         const error = new Error('Please upload an image file') as ApiError;
//         error.statusCode = 400;
//         throw error;
//     }

//     const imagePath = req.file.path;

//     // Create analysis job
//     // const result = await analysisService.createAnalysis(imagePath);

//     res.status(202).json({
//         success: true,
//         message: 'Analysis job created successfully',
//         data: {
//             jobId: result.jobId,
//             status: result.status,
//             estimatedTime: 5 // Approximate time in seconds
//         }
//     });
// });

// export const getAnalysisStatus = asyncHandler(async (req: Request, res: Response) =>
// {
//     const { jobId } = req.params;

//     if (!jobId)
//     {
//         const error = new Error('Job ID is required') as ApiError;
//         error.statusCode = 400;
//         throw error;
//     }

//     const status = await analysisService.getAnalysisStatus(jobId);

//     res.status(200).json({
//         success: true,
//         data: status
//     });
// });

// export const getAnalysisResults = asyncHandler(async (req: Request, res: Response) =>
// {
//     const { jobId } = req.params;

//     if (!jobId)
//     {
//         const error = new Error('Job ID is required') as ApiError;
//         error.statusCode = 400;
//         throw error;
//     }

//     const results = await analysisService.getAnalysisResults(jobId);

//     res.status(200).json({
//         success: true,
//         data: results
//     });
// });

// export const controllers = {
//     uploadAndAnalyze,
//     getAnalysisStatus,
//     getAnalysisResults
// };

// export default controllers;