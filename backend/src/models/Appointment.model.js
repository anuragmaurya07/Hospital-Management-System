import mongoose from 'mongoose';
import { APPOINTMENT_STATUS, PAYMENT_STATUS } from '../constants/statuses.js';

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required']
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required']
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required']
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required']
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['General', 'Follow-up', 'Emergency', 'Routine Checkup'],
      default: 'General'
    },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.PENDING
    },
    reason: {
      type: String,
      required: [true, 'Reason for visit is required']
    },
    notes: {
      type: String,
      default: ''
    },
    fee: {
      type: Number,
      required: true,
      default: 50
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID
    }
  },
  {
    timestamps: true
  }
);

// Prevent double booking for the same doctor, date, and slot if not cancelled
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $nin: ['Cancelled'] } }
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
