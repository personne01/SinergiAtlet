import { Router } from 'express';
import * as jobsController from '../controllers/jobsController';

const router = Router();

router.get('/', jobsController.getAll);
router.get('/:id', jobsController.getById);
// Protected routes (future: POST/PUT/DELETE) — uncomment when needed
// router.post('/', authenticate, requireRole('klub', 'pencari_bakat', 'admin'), jobsController.create);

export default router;
