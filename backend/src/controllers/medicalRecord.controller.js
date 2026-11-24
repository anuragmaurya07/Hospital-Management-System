import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import MedicalRecord from '../models/MedicalRecord.model.js';
import Appointment from '../models/Appointment.model.js';
import Doctor from '../models/Doctor.model.js';
import Patient from '../models/Patient.model.js';
import { APPOINTMENT_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';

export const getMedicalRecords = asyncHandler(async (req, res) => {
  const { patient, doctor, page = 1, limit = 20, search } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = {};

  if (req.user.role === ROLES.DOCTOR) {
    const doc = await Doctor.findOne({ user: req.user._id });
    if (doc) filter.doctor = doc._id;
  } else if (req.user.role === ROLES.PATIENT) {
    const pat = await Patient.findOne({ user: req.user._id });
    if (pat) filter.patient = pat._id;
  }

  if (patient) filter.patient = patient;
  if (doctor) filter.doctor = doctor;

  if (search) {
    filter.$or = [
      { diagnosis: { $regex: search, $options: 'i' } },
      { recordNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const [records, total] = await Promise.all([
    MedicalRecord.find(filter)
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('patient', 'name patientId phone gender bloodGroup')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      })
      .populate('appointment', 'appointmentNumber appointmentDate'),
    MedicalRecord.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(200, records, 'Medical records retrieved', {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    })
  );
});

export const getMedicalRecordById = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id)
    .populate('patient', 'name patientId phone gender bloodGroup address allergies chronicConditions')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name phone' }
    })
    .populate('appointment', 'appointmentNumber appointmentDate');

  if (!record) {
    throw new ApiError(404, 'Medical record not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, record, 'Medical record retrieved'));
});

export const createMedicalRecord = asyncHandler(async (req, res) => {
  let {
    patient,
    doctor,
    appointment,
    visitDate,
    vitals,
    symptoms,
    diagnosis,
    clinicalNotes,
    treatmentPlan,
    allergiesNoted,
    followUpDate,
    attachments
  } = req.body;

  if (req.user.role === ROLES.DOCTOR) {
    const doc = await Doctor.findOne({ user: req.user._id });
    if (doc) doctor = doc._id;
  }

  if (!patient || !doctor || !diagnosis) {
    throw new ApiError(400, 'Patient, doctor, and diagnosis are required');
  }

  const count = await MedicalRecord.countDocuments();
  const year = new Date().getFullYear();
  const recordNumber = `REC-${year}-${String(count + 1).padStart(4, '0')}`;

  const record = await MedicalRecord.create({
    recordNumber,
    patient,
    doctor,
    appointment: appointment || null,
    visitDate: visitDate || Date.now(),
    vitals: vitals || {},
    symptoms: symptoms || [],
    diagnosis,
    clinicalNotes: clinicalNotes || '',
    treatmentPlan: treatmentPlan || '',
    allergiesNoted: allergiesNoted || [],
    followUpDate: followUpDate || null,
    attachments: attachments || []
  });

  // If linked to appointment, advance appointment status to Completed
  if (appointment) {
    await Appointment.findByIdAndUpdate(appointment, {
      status: APPOINTMENT_STATUS.COMPLETED
    });
  }

  const populated = await MedicalRecord.findById(record._id)
    .populate('patient', 'name patientId phone')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    });

  return res
    .status(201)
    .json(new ApiResponse(201, populated, 'Medical record created successfully'));
});

export const updateMedicalRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  )
    .populate('patient', 'name patientId phone')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    });

  if (!record) {
    throw new ApiError(404, 'Medical record not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, record, 'Medical record updated successfully'));
});
