import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Department from '../models/Department.model.js';
import Doctor from '../models/Doctor.model.js';

export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true })
    .populate({
      path: 'headOfDepartment',
      populate: { path: 'user', select: 'name email phone avatar' }
    })
    .sort({ name: 1 });

  // Augment with doctor count per department
  const doctorCounts = await Doctor.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$department', count: { $sum: 1 } } }
  ]);

  const countMap = {};
  doctorCounts.forEach((dc) => {
    countMap[dc._id.toString()] = dc.count;
  });

  const result = departments.map((dept) => {
    const doc = dept.toObject();
    doc.doctorCount = countMap[dept._id.toString()] || 0;
    return doc;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Departments retrieved successfully'));
});

export const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id).populate({
    path: 'headOfDepartment',
    populate: { path: 'user', select: 'name email phone avatar' }
  });

  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  const doctors = await Doctor.find({ department: department._id, isActive: true })
    .populate('user', 'name email phone avatar');

  return res.status(200).json(
    new ApiResponse(
      200,
      { department, doctors },
      'Department details retrieved successfully'
    )
  );
});

export const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description, headOfDepartment, location, contactNumber } = req.body;

  if (!name || !code) {
    throw new ApiError(400, 'Department name and code are required');
  }

  const existing = await Department.findOne({
    $or: [{ code: code.toUpperCase() }, { name }]
  });

  if (existing) {
    throw new ApiError(409, 'Department with this name or code already exists');
  }

  const department = await Department.create({
    name,
    code: code.toUpperCase(),
    description: description || '',
    headOfDepartment: headOfDepartment || null,
    location: location || 'Main Hospital Wing',
    contactNumber: contactNumber || ''
  });

  return res
    .status(201)
    .json(new ApiResponse(201, department, 'Department created successfully'));
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, department, 'Department updated successfully'));
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Department deactivated successfully'));
});
