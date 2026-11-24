import { Router } from 'express';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment
} from '../controllers/appointment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT),
  createAppointment
);
router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR),
  updateAppointment
);
router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR),
  updateAppointmentStatus
);
router.delete(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT),
  cancelAppointment
);

export default router;
