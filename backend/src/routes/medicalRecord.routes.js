import { Router } from 'express';
import {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord
} from '../controllers/medicalRecord.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT),
  getMedicalRecords
);
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT),
  getMedicalRecordById
);
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.DOCTOR),
  createMedicalRecord
);
router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.DOCTOR),
  updateMedicalRecord
);

export default router;
