import { Router } from 'express';
import {
  getFinancialReport,
  getAppointmentReport,
  getDemographicsReport
} from '../controllers/reports.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/financial', getFinancialReport);
router.get('/appointments', getAppointmentReport);
router.get('/demographics', getDemographicsReport);

export default router;
