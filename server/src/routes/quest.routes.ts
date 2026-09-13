import { Router } from 'express';
import {
  create,
  list,
  getOne,
  update,
  remove,
  complete,
} from '../controllers/quest.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, create);
router.get('/', authenticate, list);
router.get('/:id', authenticate, getOne);
router.patch('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);
router.post('/:id/complete', authenticate, complete);

export default router;