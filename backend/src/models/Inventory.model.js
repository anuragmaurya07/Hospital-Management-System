import mongoose from 'mongoose';
import { INVENTORY_STATUS } from '../constants/statuses.js';

const inventorySchema = new mongoose.Schema(
  {
    itemCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true
    },
    category: {
      type: String,
      enum: [
        'Medical Equipment',
        'Surgical Instruments',
        'Consumables',
        'PPE',
        'Laboratory Supplies',
        'Bedding & Linen',
        'Other'
      ],
      default: 'Consumables'
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    unit: {
      type: String,
      default: 'Pieces'
    },
    minRequiredQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 10
    },
    supplier: {
      name: { type: String, default: '' },
      contactPerson: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' }
    },
    unitCost: {
      type: Number,
      default: 0
    },
    storageLocation: {
      type: String,
      default: 'Main Store Room'
    },
    lastRestocked: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: Object.values(INVENTORY_STATUS),
      default: INVENTORY_STATUS.IN_STOCK
    }
  },
  {
    timestamps: true
  }
);

// Auto-update status before saving based on quantity vs minRequiredQuantity
inventorySchema.pre('save', function (next) {
  if (this.quantity === 0) {
    this.status = INVENTORY_STATUS.OUT_OF_STOCK;
  } else if (this.quantity <= this.minRequiredQuantity) {
    this.status = INVENTORY_STATUS.LOW_STOCK;
  } else {
    this.status = INVENTORY_STATUS.IN_STOCK;
  }
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
