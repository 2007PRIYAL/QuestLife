import { Router } from 'express';
import {
  getMyProfile,
  patchMyProfile,
} from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getMyProfile);
router.patch('/', authenticate, patchMyProfile);

export default router;