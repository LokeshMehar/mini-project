import { Router } from 'express';
// import analysisRoutes from './analysisRoutes';

import testRoutes from './testRoutes';

const router = Router();

// API Routes
// router.use('/api', analysisRoutes);
router.use('/test', testRoutes);

export default router;