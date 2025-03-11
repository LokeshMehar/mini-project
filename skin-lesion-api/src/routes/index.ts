import { Router } from 'express';
import analysisRoutes from './analysisRoutes';

const router = Router();

// API Routes
router.use('/api', analysisRoutes);

export default router;