import { Router } from 'express';
import {
  getPublishedEntries,
  getAllEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  bulkAction,
} from '../controllers/entriesController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/public', getPublishedEntries);

router.get('/',        authenticate, getAllEntries);
router.post('/bulk',   authenticate, bulkAction);
router.get('/:id',    authenticate, getEntry);
router.post('/',       authenticate, createEntry);
router.put('/:id',    authenticate, updateEntry);
router.delete('/:id', authenticate, deleteEntry);

export default router;
