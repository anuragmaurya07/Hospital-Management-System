import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required']
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true
    },
    experienceYears: {
      type: Number,
      default: 1,
      min: 0
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: 0,
      default: 50
    },
    roomNumber: {
      type: String,
      default: 'Room 101'
    },
    availableDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    workingHours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '17:00'
      }
    },
    slotDurationMinutes: {
      type: Number,
      default: 30
    },
    biography: {
      type: String,
      default: ''
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

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
