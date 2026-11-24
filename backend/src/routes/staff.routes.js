import { Router } from 'express';
import {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} from '../controllers/staff.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN), getStaff);
router.get('/:id', authorize(ROLES.ADMIN), getStaffById);
router.post('/', authorize(ROLES.ADMIN), createStaff);
router.put('/:id', authorize(ROLES.ADMIN), updateStaff);
router.delete('/:id', authorize(ROLES.ADMIN), deleteStaff);

export default router;
