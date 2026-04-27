import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';
import {
  createProject,
  listProjects,
  submitFeedback,
  batchFeedback,
  uploadFeedback,
} from '../controllers/feedbackController';

const router = Router();

const feedbackLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });

router.use(authenticate);

router.post('/projects', createProject);
router.get('/projects', listProjects);

router.post('/feedback/submit', feedbackLimiter, submitFeedback);
router.post('/feedback/batch', feedbackLimiter, batchFeedback);
router.post('/feedback/upload', feedbackLimiter, upload.single('file'), uploadFeedback);

export default router;
