import { Router } from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/department.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', authorize(ROLES.ADMIN), createDepartment);
router.put('/:id', authorize(ROLES.ADMIN), updateDepartment);
router.delete('/:id', authorize(ROLES.ADMIN), deleteDepartment);

export default router;
