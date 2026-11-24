import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Medicine from '../models/Medicine.model.js';
import dayjs from 'dayjs';

export const getMedicines = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', category, lowStock } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = { isActive: true };

  if (category) filter.category = category;
  if (lowStock === 'true') {
    filter.$expr = { $lte: ['$stockQuantity', '$reorderLevel'] };
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { genericName: { $regex: search, $options: 'i' } },
      { medicineId: { $regex: search, $options: 'i' } },
      { batchNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const [medicines, total] = await Promise.all([
    Medicine.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum),
    Medicine.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(200, medicines, 'Medicines retrieved successfully', {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    })
  );
});

export const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) {
    throw new ApiError(404, 'Medicine not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, medicine, 'Medicine retrieved successfully'));
});

export const createMedicine = asyncHandler(async (req, res) => {
  const {
    name,
    genericName,
    category,
    manufacturer,
    batchNumber,
    expiryDate,
    purchasePrice,
    sellingPrice,
    stockQuantity,
    reorderLevel,
    unit,
    locationRack
  } = req.body;

  if (!name || !batchNumber || !expiryDate || sellingPrice === undefined) {
    throw new ApiError(400, 'Name, batch number, expiry date, and selling price are required');
  }

  const count = await Medicine.countDocuments();
  const year = new Date().getFullYear();
  const medicineId = `MED-${year}-${String(count + 1).padStart(4, '0')}`;

  const medicine = await Medicine.create({
    medicineId,
    name,
    genericName: genericName || '',
    category: category || 'General',
    manufacturer: manufacturer || '',
    batchNumber,
    expiryDate,
    purchasePrice: purchasePrice || 0,
    sellingPrice,
    stockQuantity: stockQuantity || 0,
    reorderLevel: reorderLevel || 15,
    unit: unit || 'Tablet',
    locationRack: locationRack || 'Shelf A1'
  });

  return res
    .status(201)
    .json(new ApiResponse(201, medicine, 'Medicine added successfully'));
});

export const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!medicine) {
    throw new ApiError(404, 'Medicine not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, medicine, 'Medicine updated successfully'));
});

export const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!medicine) {
    throw new ApiError(404, 'Medicine not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Medicine deactivated successfully'));
});

export const getStockAlerts = asyncHandler(async (req, res) => {
  const in30Days = dayjs().add(30, 'day').toDate();

  const [lowStock, expiringSoon] = await Promise.all([
    Medicine.find({
      isActive: true,
      $expr: { $lte: ['$stockQuantity', '$reorderLevel'] }
    }).sort({ stockQuantity: 1 }),
    Medicine.find({
      isActive: true,
      expiryDate: { $lte: in30Days }
    }).sort({ expiryDate: 1 })
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { lowStock, expiringSoon },
      'Pharmacy alerts retrieved successfully'
    )
  );
});
