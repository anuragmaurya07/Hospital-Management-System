import { Router } from 'express';
import {
  getLabTests,
  getLabTestById,
  createLabTest,
  submitTestResults,
  updateLabTestStatus
} from '../controllers/laboratory.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.LAB_TECHNICIAN),
  getLabTests
);
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.LAB_TECHNICIAN),
  getLabTestById
);
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.LAB_TECHNICIAN),
  createLabTest
);
router.put(
  '/:id/results',
  authorize(ROLES.ADMIN, ROLES.LAB_TECHNICIAN),
  submitTestResults
);
router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.LAB_TECHNICIAN),
  updateLabTestStatus
);

export default router;
