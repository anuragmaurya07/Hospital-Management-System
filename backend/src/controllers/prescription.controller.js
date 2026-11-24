import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Prescription from '../models/Prescription.model.js';
import Medicine from '../models/Medicine.model.js';
import Doctor from '../models/Doctor.model.js';
import Patient from '../models/Patient.model.js';
import { PRESCRIPTION_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';

export const getPrescriptions = asyncHandler(async (req, res) => {
  const { patient, doctor, status, page = 1, limit = 20, search } = req.query;

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
  if (status) filter.status = status;

  if (search) {
    filter.$or = [
      { prescriptionNumber: { $regex: search, $options: 'i' } },
      { diagnosis: { $regex: search, $options: 'i' } }
    ];
  }

  const [prescriptions, total] = await Promise.all([
    Prescription.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('patient', 'name patientId phone gender bloodGroup allergies')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      })
      .populate('dispensedBy', 'name'),
    Prescription.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(200, prescriptions, 'Prescriptions retrieved', {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    })
  );
});

export const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patient', 'name patientId phone gender bloodGroup address allergies')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name phone' }
    })
    .populate('dispensedBy', 'name');

  if (!prescription) {
    throw new ApiError(404, 'Prescription not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, prescription, 'Prescription retrieved'));
});

export const createPrescription = asyncHandler(async (req, res) => {
  let { patient, doctor, appointment, diagnosis, medicines, generalAdvice } = req.body;

  if (req.user.role === ROLES.DOCTOR) {
    const doc = await Doctor.findOne({ user: req.user._id });
    if (doc) doctor = doc._id;
  }

  if (!patient || !doctor || !medicines || medicines.length === 0) {
    throw new ApiError(400, 'Patient, doctor, and at least one medicine item are required');
  }

  const count = await Prescription.countDocuments();
  const year = new Date().getFullYear();
  const prescriptionNumber = `RX-${year}-${String(count + 1).padStart(4, '0')}`;

  const prescription = await Prescription.create({
    prescriptionNumber,
    patient,
    doctor,
    appointment: appointment || null,
    diagnosis: diagnosis || '',
    medicines,
    generalAdvice: generalAdvice || '',
    status: PRESCRIPTION_STATUS.ISSUED
  });

  const populated = await Prescription.findById(prescription._id)
    .populate('patient', 'name patientId phone')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    });

  return res
    .status(201)
    .json(new ApiResponse(201, populated, 'Prescription issued successfully'));
});

export const dispensePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) {
    throw new ApiError(404, 'Prescription not found');
  }

  if (prescription.status === PRESCRIPTION_STATUS.DISPENSED) {
    throw new ApiError(400, 'Prescription has already been dispensed');
  }

  // Attempt to decrement stock for recognized medicines
  for (const item of prescription.medicines) {
    if (item.medicine) {
      await Medicine.findByIdAndUpdate(item.medicine, {
        $inc: { stockQuantity: -1 }
      });
    } else {
      // Look up by name
      const med = await Medicine.findOne({
        name: { $regex: new RegExp(`^${item.name}$`, 'i') }
      });
      if (med && med.stockQuantity > 0) {
        med.stockQuantity -= 1;
        await med.save();
      }
    }
  }

  prescription.status = PRESCRIPTION_STATUS.DISPENSED;
  prescription.dispensedBy = req.user._id;
  prescription.dispensedAt = new Date();
  await prescription.save();

  const updated = await Prescription.findById(prescription._id)
    .populate('patient', 'name patientId phone')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    })
    .populate('dispensedBy', 'name');

  return res
    .status(200)
    .json(new ApiResponse(200, updated, 'Prescription dispensed successfully and stock adjusted'));
});
