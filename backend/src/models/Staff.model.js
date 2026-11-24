import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
  {
    staffId: {
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
      default: null
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true
    },
    shift: {
      type: String,
      enum: ['Morning', 'Evening', 'Night', 'Rotational'],
      default: 'Morning'
    },
    qualification: {
      type: String,
      default: ''
    },
    salary: {
      type: Number,
      default: 0
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Active', 'On-Leave', 'Resigned', 'Terminated'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

const Staff = mongoose.model('Staff', staffSchema);
export default Staff;
