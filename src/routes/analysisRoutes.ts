import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { getReport, getSentiment, getThemes, exportReport } from '../controllers/analysisController';

const router = Router();

router.use(authenticate);

router.get('/report/:projectId', getReport);
router.get('/sentiment/:projectId', getSentiment);
router.get('/themes/:projectId', getThemes);
router.get('/export/:projectId', exportReport);

export default router;
