import { Router } from 'express';
import {
  recordPayment,
  getPayments,
  getPaymentById
} from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST),
  recordPayment
);
router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
  getPayments
);
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT),
  getPaymentById
);

export default router;
