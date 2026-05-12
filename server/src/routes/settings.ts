import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.get('/',  authenticate, getSettings);
router.put('/',  authenticate, requireAdmin, updateSettings);

export default router;
