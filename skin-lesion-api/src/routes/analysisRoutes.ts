// import { Router } from 'express';
// import { analysisController } from '../controllers';
// import upload from '../middlewares/uploadMiddleware';

// const router = Router();

// /**
//  * @route   POST /api/analyze
//  * @desc    Upload and analyze a skin image
//  * @access  Public
//  */
// router.post('/analyze', upload.single('image'), analysisController.uploadAndAnalyze);

// /**
//  * @route   GET /api/status/:jobId
//  * @desc    Get status of an analysis job
//  * @access  Public
//  */
// router.get('/status/:jobId', analysisController.getAnalysisStatus);

// /**
//  * @route   GET /api/results/:jobId
//  * @desc    Get results of a completed analysis
//  * @access  Public
//  */
// router.get('/results/:jobId', analysisController.getAnalysisResults);

// export default router;