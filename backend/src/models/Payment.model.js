import mongoose from 'mongoose';
import { PAYMENT_METHODS } from '../constants/statuses.js';

const paymentSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    billing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Billing',
      required: [true, 'Billing reference is required']
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required']
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      default: PAYMENT_METHODS.CASH
    },
    transactionId: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
