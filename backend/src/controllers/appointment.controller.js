import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Appointment from '../models/Appointment.model.js';
import Doctor from '../models/Doctor.model.js';
import Patient from '../models/Patient.model.js';
import Billing from '../models/Billing.model.js';
import { APPOINTMENT_STATUS, PAYMENT_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';
import dayjs from 'dayjs';

export const getAppointments = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    doctor,
    patient,
    startDate,
    endDate,
    search
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = {};

  // If requesting user is a Doctor, restrict to their appointments unless Admin/Receptionist
  if (req.user.role === ROLES.DOCTOR) {
    const doc = await Doctor.findOne({ user: req.user._id });
    if (doc) filter.doctor = doc._id;
  } else if (req.user.role === ROLES.PATIENT) {
    const pat = await Patient.findOne({ user: req.user._id });
    if (pat) filter.patient = pat._id;
  }

  if (doctor) filter.doctor = doctor;
  if (patient) filter.patient = patient;
  if (status) filter.status = status;

  if (startDate && endDate) {
    filter.appointmentDate = {
      $gte: dayjs(startDate).startOf('day').toDate(),
      $lte: dayjs(endDate).endOf('day').toDate()
    };
  } else if (startDate) {
    filter.appointmentDate = {
      $gte: dayjs(startDate).startOf('day').toDate()
    };
  }

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .sort({ appointmentDate: -1, timeSlot: 1 })
      .skip(skip)
      .limit(limitNum)
      .populate('patient', 'name patientId phone gender bloodGroup')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name phone avatar' }
      })
      .populate('department', 'name code location'),
    Appointment.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(200, appointments, 'Appointments retrieved successfully', {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    })
  );
});

export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'name patientId phone gender bloodGroup address allergies emergencyContact')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name phone avatar' }
    })
    .populate('department', 'name code location');

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, appointment, 'Appointment details retrieved'));
});

export const createAppointment = asyncHandler(async (req, res) => {
  let {
    patient,
    doctor,
    department,
    appointmentDate,
    timeSlot,
    type,
    reason,
    notes
  } = req.body;

  // If patient role, self-assign their patient ID
  if (req.user.role === ROLES.PATIENT) {
    let patientRecord = await Patient.findOne({ user: req.user._id });
    if (!patientRecord) {
      patientRecord = await Patient.findOne({ email: req.user.email });
    }
    if (!patientRecord) {
      throw new ApiError(400, 'No linked patient profile found for this user');
    }
    patient = patientRecord._id;
  }

  if (!patient || !doctor || !appointmentDate || !timeSlot || !reason) {
    throw new ApiError(400, 'Patient, doctor, appointment date, time slot, and reason are required');
  }

  const doctorRecord = await Doctor.findById(doctor);
  if (!doctorRecord) {
    throw new ApiError(404, 'Selected doctor not found');
  }

  if (!department) {
    department = doctorRecord.department;
  }

  const targetDate = dayjs(appointmentDate).startOf('day').toDate();

  // Prevent double booking
  const existing = await Appointment.findOne({
    doctor,
    appointmentDate: targetDate,
    timeSlot,
    status: { $nin: ['Cancelled'] }
  });

  if (existing) {
    throw new ApiError(409, `Doctor is already booked for ${timeSlot} on this date. Please choose another slot.`);
  }

  const count = await Appointment.countDocuments();
  const year = new Date().getFullYear();
  const appointmentNumber = `APT-${year}-${String(count + 1).padStart(4, '0')}`;

  const fee = doctorRecord.consultationFee || 50;

  const appointment = await Appointment.create({
    appointmentNumber,
    patient,
    doctor,
    department,
    appointmentDate: targetDate,
    timeSlot,
    type: type || 'General',
    status: APPOINTMENT_STATUS.CONFIRMED,
    reason,
    notes: notes || '',
    fee,
    paymentStatus: PAYMENT_STATUS.UNPAID
  });

  // Auto-generate invoice
  const invCount = await Billing.countDocuments();
  const invoiceNumber = `INV-${year}-${String(invCount + 1).padStart(4, '0')}`;
  const taxRate = 5;
  const taxAmount = Number(((fee * taxRate) / 100).toFixed(2));
  const totalAmount = Number((fee + taxAmount).toFixed(2));

  await Billing.create({
    invoiceNumber,
    patient,
    appointment: appointment._id,
    items: [
      {
        description: `Consultation with Dr. Specialist`,
        category: 'Consultation',
        quantity: 1,
        unitPrice: fee,
        amount: fee
      }
    ],
    subtotal: fee,
    taxRate,
    taxAmount,
    discountAmount: 0,
    totalAmount,
    paidAmount: 0,
    balanceAmount: totalAmount,
    paymentStatus: PAYMENT_STATUS.UNPAID,
    createdBy: req.user._id
  });

  const populated = await Appointment.findById(appointment._id)
    .populate('patient', 'name patientId phone')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    })
    .populate('department', 'name');

  return res
    .status(201)
    .json(new ApiResponse(201, populated, 'Appointment booked successfully'));
});

export const updateAppointment = asyncHandler(async (req, res) => {
  const { appointmentDate, timeSlot, reason, notes, type } = req.body;

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  if (appointmentDate && timeSlot) {
    const targetDate = dayjs(appointmentDate).startOf('day').toDate();
    const existing = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctor: appointment.doctor,
      appointmentDate: targetDate,
      timeSlot,
      status: { $nin: ['Cancelled'] }
    });

    if (existing) {
      throw new ApiError(409, `The doctor is already booked for ${timeSlot} on that date.`);
    }

    appointment.appointmentDate = targetDate;
    appointment.timeSlot = timeSlot;
  }

  if (reason) appointment.reason = reason;
  if (notes !== undefined) appointment.notes = notes;
  if (type) appointment.type = type;

  await appointment.save();

  const populated = await Appointment.findById(appointment._id)
    .populate('patient', 'name patientId phone')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    })
    .populate('department', 'name');

  return res
    .status(200)
    .json(new ApiResponse(200, populated, 'Appointment updated successfully'));
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !Object.values(APPOINTMENT_STATUS).includes(status)) {
    throw new ApiError(400, 'A valid appointment status is required');
  }

  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  )
    .populate('patient', 'name patientId phone')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    })
    .populate('department', 'name');

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, appointment, `Appointment status updated to ${status}`));
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: APPOINTMENT_STATUS.CANCELLED },
    { new: true }
  );

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, appointment, 'Appointment cancelled successfully'));
});
