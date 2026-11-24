import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Staff from '../models/Staff.model.js';
import User from '../models/User.model.js';
import { ROLES } from '../constants/roles.js';

export const getStaff = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, department, shift, status, search } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (department) filter.department = department;
  if (shift) filter.shift = shift;
  if (status) filter.status = status;

  let staffQuery = Staff.find(filter)
    .populate('user', 'name email phone avatar isActive role')
    .populate('department', 'name code');

  let staffList = await staffQuery.exec();

  if (search) {
    const s = search.toLowerCase();
    staffList = staffList.filter(
      (item) =>
        item.user?.name?.toLowerCase().includes(s) ||
        item.designation?.toLowerCase().includes(s) ||
        item.staffId?.toLowerCase().includes(s)
    );
  }

  const total = staffList.length;
  const paginated = staffList.slice(skip, skip + limitNum);

  return res.status(200).json(
    new ApiResponse(200, paginated, 'Staff list retrieved successfully', {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    })
  );
});

export const getStaffById = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id)
    .populate('user', 'name email phone avatar role isActive')
    .populate('department', 'name code location');

  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, staff, 'Staff details retrieved'));
});

export const createStaff = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    role = ROLES.RECEPTIONIST,
    department,
    designation,
    shift = 'Morning',
    qualification,
    salary,
    joiningDate
  } = req.body;

  if (!name || !email || !password || !designation) {
    throw new ApiError(400, 'Name, email, password, and designation are required');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone: phone || ''
  });

  const count = await Staff.countDocuments();
  const year = new Date().getFullYear();
  const staffId = `STF-${year}-${String(count + 1).padStart(4, '0')}`;

  const staff = await Staff.create({
    staffId,
    user: user._id,
    department: department || null,
    designation,
    shift,
    qualification: qualification || '',
    salary: salary || 0,
    joiningDate: joiningDate || Date.now(),
    status: 'Active'
  });

  const populated = await Staff.findById(staff._id)
    .populate('user', 'name email phone role avatar')
    .populate('department', 'name code');

  return res
    .status(201)
    .json(new ApiResponse(201, populated, 'Staff member created successfully'));
});

export const updateStaff = asyncHandler(async (req, res) => {
  const { name, phone, role, ...staffFields } = req.body;

  const staff = await Staff.findById(req.params.id);
  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  if (name || phone !== undefined || role) {
    await User.findByIdAndUpdate(staff.user, {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(role && { role })
    });
  }

  const updatedStaff = await Staff.findByIdAndUpdate(
    req.params.id,
    { $set: staffFields },
    { new: true, runValidators: true }
  )
    .populate('user', 'name email phone role avatar')
    .populate('department', 'name code');

  return res
    .status(200)
    .json(new ApiResponse(200, updatedStaff, 'Staff details updated'));
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findByIdAndUpdate(
    req.params.id,
    { status: 'Terminated' },
    { new: true }
  );

  if (!staff) {
    throw new ApiError(404, 'Staff member not found');
  }

  await User.findByIdAndUpdate(staff.user, { isActive: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Staff member deactivated'));
});
