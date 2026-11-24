import { Router } from 'express';
import {
  getPatients,
  getPatientById,
  getPatientHistory,
  createPatient,
  updatePatient,
  deletePatient
} from '../controllers/patient.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.LAB_TECHNICIAN, ROLES.PHARMACIST),
  getPatients
);
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT),
  getPatientById
);
router.get(
  '/:id/history',
  authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
  getPatientHistory
);
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR),
  createPatient
);
router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR),
  updatePatient
);
router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  deletePatient
);

export default router;
