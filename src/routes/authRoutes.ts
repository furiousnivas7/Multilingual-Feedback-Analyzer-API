import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login } from '../controllers/authController';

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

export default router;
