import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/admin/pending', authenticate, requireRole('admin'), authController.getPendingUsers);
router.post('/admin/approve/:userId', authenticate, requireRole('admin'), authController.approveUser);
router.post('/admin/reject/:userId', authenticate, requireRole('admin'), authController.rejectUser);

export default router;
