import { Router } from 'express';
import * as careerController from '../controllers/careerController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:athleteId', authenticate, careerController.getProgress);

export default router;
