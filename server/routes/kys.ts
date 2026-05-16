import { Router } from 'express';
import * as kysController from '../controllers/kysController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/sports', kysController.getSports);
router.get('/assessments/:athleteId', authenticate, kysController.getAssessments);
router.post('/assessments/:athleteId', authenticate, kysController.upsertAssessment);
router.get('/:athleteId', authenticate, kysController.getKYSRecords);
router.get('/:athleteId/scores', authenticate, kysController.getKYSScores);

export default router;
