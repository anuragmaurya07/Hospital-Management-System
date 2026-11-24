import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Inventory from '../models/Inventory.model.js';

export const getInventory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, status, search } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { itemCode: { $regex: search, $options: 'i' } }
    ];
  }

  const [items, total] = await Promise.all([
    Inventory.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Inventory.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(200, items, 'Inventory items retrieved', {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    })
  );
});

export const getInventoryById = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  if (!item) {
    throw new ApiError(404, 'Inventory item not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, item, 'Inventory item retrieved'));
});

export const createInventoryItem = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    quantity = 0,
    unit = 'Pieces',
    minRequiredQuantity = 10,
    supplier,
    unitCost = 0,
    storageLocation
  } = req.body;

  if (!name) {
    throw new ApiError(400, 'Item name is required');
  }

  const count = await Inventory.countDocuments();
  const year = new Date().getFullYear();
  const itemCode = `INV-${year}-${String(count + 1).padStart(4, '0')}`;

  const item = await Inventory.create({
    itemCode,
    name,
    category: category || 'Consumables',
    quantity,
    unit,
    minRequiredQuantity,
    supplier: supplier || {},
    unitCost,
    storageLocation: storageLocation || 'Central Medical Store',
    lastRestocked: new Date()
  });

  return res
    .status(201)
    .json(new ApiResponse(201, item, 'Inventory item added successfully'));
});

export const updateInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  if (!item) {
    throw new ApiError(404, 'Inventory item not found');
  }

  Object.assign(item, req.body);
  await item.save();

  return res
    .status(200)
    .json(new ApiResponse(200, item, 'Inventory item updated successfully'));
});

export const restockInventoryItem = asyncHandler(async (req, res) => {
  const { quantityToAdd } = req.body;

  if (!quantityToAdd || Number(quantityToAdd) <= 0) {
    throw new ApiError(400, 'Valid positive restock quantity required');
  }

  const item = await Inventory.findById(req.params.id);
  if (!item) {
    throw new ApiError(404, 'Inventory item not found');
  }

  item.quantity += Number(quantityToAdd);
  item.lastRestocked = new Date();
  await item.save();

  return res
    .status(200)
    .json(new ApiResponse(200, item, `Restocked ${quantityToAdd} ${item.unit} successfully`));
});

export const deleteInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findByIdAndDelete(req.params.id);
  if (!item) {
    throw new ApiError(404, 'Inventory item not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Inventory item deleted successfully'));
});
