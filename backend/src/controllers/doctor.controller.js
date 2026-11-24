import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Doctor from '../models/Doctor.model.js';
import User from '../models/User.model.js';
import Appointment from '../models/Appointment.model.js';
import { ROLES } from '../constants/roles.js';
import dayjs from 'dayjs';

export const getDoctors = asyncHandler(async (req, res) => {
  const { department, search = '', page = 1, limit = 20 } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = { isActive: true };
  if (department) {
    filter.department = department;
  }

  let doctorQuery = Doctor.find(filter)
    .populate('user', 'name email phone avatar isActive')
    .populate('department', 'name code location');

  let doctors = await doctorQuery.exec();

  if (search) {
    const s = search.toLowerCase();
    doctors = doctors.filter(
      (doc) =>
        doc.user?.name?.toLowerCase().includes(s) ||
        doc.specialization?.toLowerCase().includes(s) ||
        doc.doctorId?.toLowerCase().includes(s)
    );
  }

  const total = doctors.length;
  const paginatedDoctors = doctors.slice(skip, skip + limitNum);

  return res.status(200).json(
    new ApiResponse(200, paginatedDoctors, 'Doctors retrieved successfully', {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    })
  );
});

export const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('user', 'name email phone avatar')
    .populate('department', 'name code location');

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, doctor, 'Doctor retrieved successfully'));
});

export const createDoctor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    department,
    specialization,
    qualification,
    experienceYears,
    consultationFee,
    roomNumber,
    availableDays,
    workingHours,
    biography
  } = req.body;

  if (!name || !email || !password || !department || !specialization) {
    throw new ApiError(400, 'Name, email, password, department, and specialization are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: ROLES.DOCTOR,
    phone: phone || ''
  });

  const count = await Doctor.countDocuments();
  const year = new Date().getFullYear();
  const doctorId = `DOC-${year}-${String(count + 1).padStart(4, '0')}`;

  const doctor = await Doctor.create({
    doctorId,
    user: user._id,
    department,
    specialization,
    qualification: qualification || 'MBBS, MD',
    experienceYears: experienceYears || 1,
    consultationFee: consultationFee || 50,
    roomNumber: roomNumber || 'Room 101',
    availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: workingHours || { start: '09:00', end: '17:00' },
    biography: biography || ''
  });

  const populatedDoctor = await Doctor.findById(doctor._id)
    .populate('user', 'name email phone avatar')
    .populate('department', 'name code');

  return res
    .status(201)
    .json(new ApiResponse(201, populatedDoctor, 'Doctor created successfully'));
});

export const updateDoctor = asyncHandler(async (req, res) => {
  const { name, phone, ...doctorFields } = req.body;

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  if (name || phone !== undefined) {
    await User.findByIdAndUpdate(doctor.user, {
      ...(name && { name }),
      ...(phone !== undefined && { phone })
    });
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { $set: doctorFields },
    { new: true, runValidators: true }
  )
    .populate('user', 'name email phone avatar')
    .populate('department', 'name code');

  return res
    .status(200)
    .json(new ApiResponse(200, updatedDoctor, 'Doctor updated successfully'));
});

export const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  await User.findByIdAndUpdate(doctor.user, { isActive: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Doctor deactivated successfully'));
});

export const getDoctorAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!date) {
    throw new ApiError(400, 'Date query parameter is required (YYYY-MM-DD)');
  }

  const doctor = await Doctor.findById(id);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  const targetDate = dayjs(date);
  const dayName = targetDate.format('dddd');

  const isAvailableDay = doctor.availableDays.includes(dayName);
  if (!isAvailableDay) {
    return res.status(200).json(
      new ApiResponse(200, {
        date,
        dayName,
        isAvailableDay: false,
        slots: []
      }, `Doctor is not available on ${dayName}s`)
    );
  }

  // Generate slots every 30 mins between workingHours start and end
  const [startHour, startMin] = (doctor.workingHours.start || '09:00').split(':').map(Number);
  const [endHour, endMin] = (doctor.workingHours.end || '17:00').split(':').map(Number);

  let current = targetDate.hour(startHour).minute(startMin).second(0);
  const endTime = targetDate.hour(endHour).minute(endMin).second(0);

  const allSlots = [];
  while (current.isBefore(endTime)) {
    allSlots.push(current.format('hh:mm A'));
    current = current.add(doctor.slotDurationMinutes || 30, 'minute');
  }

  // Find booked slots for this date
  const startOfDay = targetDate.startOf('day').toDate();
  const endOfDay = targetDate.endOf('day').toDate();

  const bookedAppointments = await Appointment.find({
    doctor: doctor._id,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ['Cancelled'] }
  }).select('timeSlot status');

  const bookedSlotSet = new Set(bookedAppointments.map((a) => a.timeSlot));

  const slotsWithStatus = allSlots.map((slot) => ({
    timeSlot: slot,
    isBooked: bookedSlotSet.has(slot)
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        date,
        dayName,
        isAvailableDay: true,
        slots: slotsWithStatus
      },
      'Doctor availability retrieved'
    )
  );
});
