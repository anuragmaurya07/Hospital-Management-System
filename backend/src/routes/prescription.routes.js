import { Router } from 'express';
import {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  dispensePrescription
} from '../controllers/prescription.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.PHARMACIST),
  getPrescriptions
);
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.PHARMACIST),
  getPrescriptionById
);
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.DOCTOR),
  createPrescription
);
router.patch(
  '/:id/dispense',
  authorize(ROLES.ADMIN, ROLES.PHARMACIST),
  dispensePrescription
);

export default router;
