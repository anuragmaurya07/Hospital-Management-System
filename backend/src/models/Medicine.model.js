import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    medicineId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true
    },
    genericName: {
      type: String,
      default: '',
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'General'
    },
    manufacturer: {
      type: String,
      default: ''
    },
    batchNumber: {
      type: String,
      required: [true, 'Batch number is required'],
      trim: true
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    reorderLevel: {
      type: Number,
      default: 15,
      min: 0
    },
    unit: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Box', 'Vial'],
      default: 'Tablet'
    },
    locationRack: {
      type: String,
      default: 'Shelf A1'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

medicineSchema.index({ name: 'text', genericName: 'text', category: 'text' });

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;
