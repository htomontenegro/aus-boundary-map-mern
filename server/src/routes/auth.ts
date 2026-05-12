import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, me, register } from '../controllers/authController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

router.post('/login',    authLimiter, login);
router.post('/register', authLimiter, authenticate, requireAdmin, register);
router.get('/me',        authenticate, me);

export default router;
