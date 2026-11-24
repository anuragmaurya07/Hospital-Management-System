import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Billing from '../models/Billing.model.js';
import Payment from '../models/Payment.model.js';
import Patient from '../models/Patient.model.js';
import { PAYMENT_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';

export const getBills = asyncHandler(async (req, res) => {
  const { patient, paymentStatus, page = 1, limit = 20, search } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = {};

  if (req.user.role === ROLES.PATIENT) {
    const pat = await Patient.findOne({ user: req.user._id });
    if (pat) filter.patient = pat._id;
  }

  if (patient) filter.patient = patient;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  if (search) {
    filter.invoiceNumber = { $regex: search, $options: 'i' };
  }

  const [bills, total] = await Promise.all([
    Billing.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('patient', 'name patientId phone email')
      .populate('appointment', 'appointmentNumber appointmentDate')
      .populate('createdBy', 'name'),
    Billing.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(200, bills, 'Bills retrieved successfully', {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    })
  );
});

export const getBillById = asyncHandler(async (req, res) => {
  const bill = await Billing.findById(req.params.id)
    .populate('patient', 'name patientId phone email address')
    .populate('appointment', 'appointmentNumber appointmentDate')
    .populate('createdBy', 'name');

  if (!bill) {
    throw new ApiError(404, 'Invoice not found');
  }

  const payments = await Payment.find({ billing: bill._id }).sort({ paymentDate: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      { bill, payments },
      'Invoice details and payments retrieved'
    )
  );
});

export const createBill = asyncHandler(async (req, res) => {
  const {
    patient,
    appointment,
    items,
    taxRate = 5,
    discountAmount = 0,
    dueDate
  } = req.body;

  if (!patient || !items || items.length === 0) {
    throw new ApiError(400, 'Patient and at least one line item are required');
  }

  const calculatedSubtotal = items.reduce(
    (acc, item) => acc + (item.quantity * item.unitPrice),
    0
  );

  const subtotal = Number(calculatedSubtotal.toFixed(2));
  const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
  const totalAmount = Number((subtotal + taxAmount - (discountAmount || 0)).toFixed(2));

  const count = await Billing.countDocuments();
  const year = new Date().getFullYear();
  const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;

  const bill = await Billing.create({
    invoiceNumber,
    patient,
    appointment: appointment || null,
    items: items.map((i) => ({
      description: i.description,
      category: i.category || 'Consultation',
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      amount: Number((i.quantity * i.unitPrice).toFixed(2))
    })),
    subtotal,
    taxRate,
    taxAmount,
    discountAmount: discountAmount || 0,
    totalAmount,
    paidAmount: 0,
    balanceAmount: totalAmount,
    paymentStatus: PAYMENT_STATUS.UNPAID,
    dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    createdBy: req.user._id
  });

  const populated = await Billing.findById(bill._id)
    .populate('patient', 'name patientId phone email');

  return res
    .status(201)
    .json(new ApiResponse(201, populated, 'Invoice generated successfully'));
});

export const updateBillStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;

  if (!paymentStatus || !Object.values(PAYMENT_STATUS).includes(paymentStatus)) {
    throw new ApiError(400, 'Valid payment status required');
  }

  const bill = await Billing.findById(req.params.id);
  if (!bill) {
    throw new ApiError(404, 'Invoice not found');
  }

  bill.paymentStatus = paymentStatus;
  if (paymentStatus === PAYMENT_STATUS.PAID) {
    bill.paidAmount = bill.totalAmount;
    bill.balanceAmount = 0;
  }

  await bill.save();

  return res
    .status(200)
    .json(new ApiResponse(200, bill, 'Invoice status updated'));
});
