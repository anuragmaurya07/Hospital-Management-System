import { Router } from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorAvailability
} from '../controllers/doctor.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/availability', getDoctorAvailability);

router.post('/', authorize(ROLES.ADMIN), createDoctor);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.DOCTOR), updateDoctor);
router.delete('/:id', authorize(ROLES.ADMIN), deleteDoctor);

export default router;
