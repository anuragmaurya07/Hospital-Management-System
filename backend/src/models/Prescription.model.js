import mongoose from 'mongoose';
import { PRESCRIPTION_STATUS } from '../constants/statuses.js';

const prescriptionItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    default: null
  },
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required (e.g., 500mg)'],
    trim: true
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required (e.g., 1-0-1 or Twice daily)'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Duration is required (e.g., 5 days)'],
    trim: true
  },
  instructions: {
    type: String,
    default: 'Take after meals'
  }
});

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionNumber: {
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
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null
    },
    diagnosis: {
      type: String,
      default: ''
    },
    medicines: [prescriptionItemSchema],
    generalAdvice: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(PRESCRIPTION_STATUS),
      default: PRESCRIPTION_STATUS.ISSUED
    },
    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    dispensedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
