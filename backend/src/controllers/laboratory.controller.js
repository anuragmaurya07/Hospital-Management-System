import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import LabTest from '../models/LabTest.model.js';
import Doctor from '../models/Doctor.model.js';
import Patient from '../models/Patient.model.js';
import { LAB_TEST_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';

export const getLabTests = asyncHandler(async (req, res) => {
  const { patient, doctor, status, category, priority, page = 1, limit = 20, search } = req.query;

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
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  if (search) {
    filter.$or = [
      { testName: { $regex: search, $options: 'i' } },
      { testNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const [tests, total] = await Promise.all([
    LabTest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('patient', 'name patientId phone gender bloodGroup')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      })
      .populate('technician', 'name'),
    LabTest.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(200, tests, 'Lab tests retrieved successfully', {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    })
  );
});

export const getLabTestById = asyncHandler(async (req, res) => {
  const test = await LabTest.findById(req.params.id)
    .populate('patient', 'name patientId phone gender bloodGroup address allergies')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name phone' }
    })
    .populate('technician', 'name');

  if (!test) {
    throw new ApiError(404, 'Lab test not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, test, 'Lab test retrieved successfully'));
});

export const createLabTest = asyncHandler(async (req, res) => {
  let { patient, doctor, appointment, testName, category, priority, sampleType, price, notes } = req.body;

  if (req.user.role === ROLES.DOCTOR) {
    const doc = await Doctor.findOne({ user: req.user._id });
    if (doc) doctor = doc._id;
  }

  if (!patient || !doctor || !testName) {
    throw new ApiError(400, 'Patient, doctor, and test name are required');
  }

  const count = await LabTest.countDocuments();
  const year = new Date().getFullYear();
  const testNumber = `LAB-${year}-${String(count + 1).padStart(4, '0')}`;

  const labTest = await LabTest.create({
    testNumber,
    patient,
    doctor,
    appointment: appointment || null,
    testName,
    category: category || 'General',
    priority: priority || 'Routine',
    sampleType: sampleType || 'Blood',
    price: price || 45,
    notes: notes || '',
    status: LAB_TEST_STATUS.REQUESTED
  });

  const populated = await LabTest.findById(labTest._id)
    .populate('patient', 'name patientId phone')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    });

  return res
    .status(201)
    .json(new ApiResponse(201, populated, 'Lab test request ordered successfully'));
});

export const submitTestResults = asyncHandler(async (req, res) => {
  const { results, notes, reportFile } = req.body;

  const test = await LabTest.findById(req.params.id);
  if (!test) {
    throw new ApiError(404, 'Lab test not found');
  }

  test.results = results || [];
  if (notes) test.notes = notes;
  if (reportFile) test.reportFile = reportFile;
  test.status = LAB_TEST_STATUS.COMPLETED;
  test.technician = req.user._id;
  test.completedDate = new Date();

  await test.save();

  const populated = await LabTest.findById(test._id)
    .populate('patient', 'name patientId phone')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    })
    .populate('technician', 'name');

  return res
    .status(200)
    .json(new ApiResponse(200, populated, 'Lab test results recorded successfully'));
});

export const updateLabTestStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !Object.values(LAB_TEST_STATUS).includes(status)) {
    throw new ApiError(400, 'Invalid status provided');
  }

  const test = await LabTest.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  )
    .populate('patient', 'name patientId phone')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    });

  if (!test) {
    throw new ApiError(404, 'Lab test not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, test, `Lab test status updated to ${status}`));
});
