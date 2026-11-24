import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Payment from '../models/Payment.model.js';
import Billing from '../models/Billing.model.js';
import Patient from '../models/Patient.model.js';
import { PAYMENT_STATUS } from '../constants/statuses.js';
import { ROLES } from '../constants/roles.js';

export const recordPayment = asyncHandler(async (req, res) => {
  const { billing: billingId, amount, paymentMethod, transactionId, notes } = req.body;

  if (!billingId || !amount || Number(amount) <= 0) {
    throw new ApiError(400, 'Billing ID and a positive payment amount are required');
  }

  const bill = await Billing.findById(billingId);
  if (!bill) {
    throw new ApiError(404, 'Invoice not found');
  }

  const payAmount = Number(Number(amount).toFixed(2));
  if (payAmount > bill.balanceAmount + 0.01) {
    throw new ApiError(400, `Payment amount ($${payAmount}) exceeds balance ($${bill.balanceAmount})`);
  }

  const count = await Payment.countDocuments();
  const year = new Date().getFullYear();
  const receiptNumber = `REC-PAY-${year}-${String(count + 1).padStart(4, '0')}`;

  const payment = await Payment.create({
    receiptNumber,
    billing: bill._id,
    patient: bill.patient,
    amount: payAmount,
    paymentMethod: paymentMethod || 'Cash',
    transactionId: transactionId || '',
    notes: notes || '',
    receivedBy: req.user._id
  });

  // Update bill paid and balance amounts
  bill.paidAmount = Number((bill.paidAmount + payAmount).toFixed(2));
  bill.balanceAmount = Number(Math.max(0, bill.totalAmount - bill.paidAmount).toFixed(2));

  if (bill.balanceAmount <= 0) {
    bill.paymentStatus = PAYMENT_STATUS.PAID;
  } else {
    bill.paymentStatus = PAYMENT_STATUS.PARTIALLY_PAID;
  }

  await bill.save();

  const populated = await Payment.findById(payment._id)
    .populate('patient', 'name patientId')
    .populate('billing', 'invoiceNumber totalAmount')
    .populate('receivedBy', 'name');

  return res
    .status(201)
    .json(new ApiResponse(201, populated, 'Payment recorded successfully'));
});

export const getPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, patient, paymentMethod } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = {};

  if (req.user.role === ROLES.PATIENT) {
    const pat = await Patient.findOne({ user: req.user._id });
    if (pat) filter.patient = pat._id;
  }

  if (patient) filter.patient = patient;
  if (paymentMethod) filter.paymentMethod = paymentMethod;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('patient', 'name patientId phone')
      .populate('billing', 'invoiceNumber totalAmount')
      .populate('receivedBy', 'name'),
    Payment.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(200, payments, 'Payments retrieved successfully', {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    })
  );
});

export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('patient', 'name patientId phone address email')
    .populate('billing', 'invoiceNumber totalAmount items subtotal taxAmount discountAmount')
    .populate('receivedBy', 'name');

  if (!payment) {
    throw new ApiError(404, 'Payment receipt not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, payment, 'Payment receipt retrieved'));
});
