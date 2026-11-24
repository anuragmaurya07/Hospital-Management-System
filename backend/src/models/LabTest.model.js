import mongoose from 'mongoose';
import { LAB_TEST_STATUS } from '../constants/statuses.js';

const labResultParameterSchema = new mongoose.Schema({
  parameter: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  unit: {
    type: String,
    default: ''
  },
  normalRange: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Normal', 'Abnormal', 'Critical'],
    default: 'Normal'
  }
});

const labTestSchema = new mongoose.Schema(
  {
    testNumber: {
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
    testName: {
      type: String,
      required: [true, 'Test name is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Hematology', 'Biochemistry', 'Radiology', 'Microbiology', 'Pathology', 'Immunology', 'General'],
      default: 'Hematology'
    },
    priority: {
      type: String,
      enum: ['Routine', 'Urgent', 'Stat'],
      default: 'Routine'
    },
    sampleType: {
      type: String,
      default: 'Blood'
    },
    status: {
      type: String,
      enum: Object.values(LAB_TEST_STATUS),
      default: LAB_TEST_STATUS.REQUESTED
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    results: [labResultParameterSchema],
    reportFile: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      default: 40
    },
    requestedDate: {
      type: Date,
      default: Date.now
    },
    completedDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const LabTest = mongoose.model('LabTest', labTestSchema);
export default LabTest;
