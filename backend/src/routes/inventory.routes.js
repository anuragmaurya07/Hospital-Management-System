import { Router } from 'express';
import {
  getInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  restockInventoryItem,
  deleteInventoryItem
} from '../controllers/inventory.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.PHARMACIST),
  getInventory
);
router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.PHARMACIST),
  getInventoryById
);
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.PHARMACIST),
  createInventoryItem
);
router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.PHARMACIST),
  updateInventoryItem
);
router.patch(
  '/:id/restock',
  authorize(ROLES.ADMIN, ROLES.PHARMACIST),
  restockInventoryItem
);
router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  deleteInventoryItem
);

export default router;
