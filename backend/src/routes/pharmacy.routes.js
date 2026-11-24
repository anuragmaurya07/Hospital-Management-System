import { Router } from 'express';
import {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getStockAlerts
} from '../controllers/pharmacy.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get('/alerts', authorize(ROLES.ADMIN, ROLES.PHARMACIST), getStockAlerts);
router.get('/', getMedicines);
router.get('/:id', getMedicineById);

router.post('/', authorize(ROLES.ADMIN, ROLES.PHARMACIST), createMedicine);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.PHARMACIST), updateMedicine);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.PHARMACIST), deleteMedicine);

export default router;
