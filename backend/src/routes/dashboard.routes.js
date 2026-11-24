import { Router } from 'express';
import {
  getAdminDashboard,
  getDoctorDashboard,
  getPatientDashboard,
  getReceptionistDashboard,
  getPharmacistDashboard,
  getLabDashboard
} from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get('/admin', authorize(ROLES.ADMIN), getAdminDashboard);
router.get('/doctor', authorize(ROLES.DOCTOR, ROLES.ADMIN), getDoctorDashboard);
router.get('/patient', authorize(ROLES.PATIENT, ROLES.ADMIN), getPatientDashboard);
router.get('/receptionist', authorize(ROLES.RECEPTIONIST, ROLES.ADMIN), getReceptionistDashboard);
router.get('/pharmacist', authorize(ROLES.PHARMACIST, ROLES.ADMIN), getPharmacistDashboard);
router.get('/laboratory', authorize(ROLES.LAB_TECHNICIAN, ROLES.ADMIN), getLabDashboard);

export default router;
