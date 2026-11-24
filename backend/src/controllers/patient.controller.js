import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Patient from '../models/Patient.model.js';
import Appointment from '../models/Appointment.model.js';
import MedicalRecord from '../models/MedicalRecord.model.js';
import Prescription from '../models/Prescription.model.js';
import LabTest from '../models/LabTest.model.js';
import Billing from '../models/Billing.model.js';

export const getPatients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', gender, bloodGroup } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { patientId: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (gender) filter.gender = gender;
  if (bloodGroup) filter.bloodGroup = bloodGroup;

  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'email avatar'),
    Patient.countDocuments(filter)
  ]);

  const pagination = {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum)
  };

  return res.status(200).json(
    new ApiResponse(200, patients, 'Patients retrieved successfully', pagination)
  );
});

export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate('user', 'email avatar phone');
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, patient, 'Patient retrieved successfully'));
});

export const getPatientHistory = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  const [appointments, medicalRecords, prescriptions, labTests, bills] =
    await Promise.all([
      Appointment.find({ patient: patient._id })
        .sort({ appointmentDate: -1 })
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name' }
        })
        .populate('department', 'name'),
      MedicalRecord.find({ patient: patient._id })
        .sort({ visitDate: -1 })
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name' }
        }),
      Prescription.find({ patient: patient._id })
        .sort({ createdAt: -1 })
        .populate({
          path: 'doctor',
          populate: { path: 'user', select: 'name' }
        }),
      LabTest.find({ patient: patient._id }).sort({ createdAt: -1 }),
      Billing.find({ patient: patient._id }).sort({ createdAt: -1 })
    ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        patient,
        appointments,
        medicalRecords,
        prescriptions,
        labTests,
        bills
      },
      'Patient clinical history retrieved successfully'
    )
  );
});

export const createPatient = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    dob,
    gender,
    bloodGroup,
    address,
    emergencyContact,
    allergies,
    chronicConditions,
    insurance
  } = req.body;

  if (!name || !phone || !dob || !gender) {
    throw new ApiError(400, 'Name, phone, date of birth, and gender are required');
  }

  const count = await Patient.countDocuments();
  const year = new Date().getFullYear();
  const patientId = `PAT-${year}-${String(count + 1).padStart(4, '0')}`;

  const patient = await Patient.create({
    patientId,
    name,
    email: email || '',
    phone,
    dob,
    gender,
    bloodGroup: bloodGroup || 'Unknown',
    address: address || {},
    emergencyContact: emergencyContact || {},
    allergies: allergies || [],
    chronicConditions: chronicConditions || [],
    insurance: insurance || {}
  });

  return res
    .status(201)
    .json(new ApiResponse(201, patient, 'Patient registered successfully'));
});

export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, patient, 'Patient details updated successfully'));
});

export const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Patient deactivated successfully'));
});
