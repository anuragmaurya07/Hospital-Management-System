import { Router } from 'express';
import {
  getBills,
  getBillById,
  createBill,
  updateBillStatus
} from '../controllers/billing.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
  getBills
);
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
  getBillById
);
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  createBill
);
router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  updateBillStatus
);

export default router;
