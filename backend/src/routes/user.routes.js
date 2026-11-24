import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUserStatus,
  uploadAvatar
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN), getUsers);
router.get('/:id', authorize(ROLES.ADMIN), getUserById);
router.patch('/:id/status', authorize(ROLES.ADMIN), updateUserStatus);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

export default router;
