import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
  {
    recordNumber: {
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
    visitDate: {
      type: Date,
      default: Date.now
    },
    vitals: {
      bloodPressure: { type: String, default: '120/80' },
      heartRate: { type: Number, default: 72 },
      temperature: { type: Number, default: 98.6 },
      respiratoryRate: { type: Number, default: 16 },
      oxygenSaturation: { type: Number, default: 98 },
      weightKg: { type: Number, default: 70 },
      heightCm: { type: Number, default: 172 }
    },
    symptoms: {
      type: [String],
      default: []
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true
    },
    clinicalNotes: {
      type: String,
      default: ''
    },
    treatmentPlan: {
      type: String,
      default: ''
    },
    allergiesNoted: {
      type: [String],
      default: []
    },
    followUpDate: {
      type: Date,
      default: null
    },
    attachments: [
      {
        name: String,
        url: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;
