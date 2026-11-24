import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Billing from '../models/Billing.model.js';
import Payment from '../models/Payment.model.js';
import Appointment from '../models/Appointment.model.js';
import Patient from '../models/Patient.model.js';
import Medicine from '../models/Medicine.model.js';
import dayjs from 'dayjs';

export const getFinancialReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const match = {};
  if (startDate && endDate) {
    match.createdAt = {
      $gte: dayjs(startDate).startOf('day').toDate(),
      $lte: dayjs(endDate).endOf('day').toDate()
    };
  }

  const [billingTotals, paymentsByMethod] = await Promise.all([
    Billing.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalInvoiced: { $sum: '$totalAmount' },
          totalCollected: { $sum: '$paidAmount' },
          totalOutstanding: { $sum: '$balanceAmount' },
          totalTax: { $sum: '$taxAmount' },
          totalDiscount: { $sum: '$discountAmount' },
          invoiceCount: { $sum: 1 }
        }
      }
    ]),
    Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$paymentMethod',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        summary: billingTotals[0] || {
          totalInvoiced: 0,
          totalCollected: 0,
          totalOutstanding: 0,
          totalTax: 0,
          totalDiscount: 0,
          invoiceCount: 0
        },
        paymentsByMethod
      },
      'Financial report generated successfully'
    )
  );
});

export const getAppointmentReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const match = {};
  if (startDate && endDate) {
    match.appointmentDate = {
      $gte: dayjs(startDate).startOf('day').toDate(),
      $lte: dayjs(endDate).endOf('day').toDate()
    };
  }

  const [statusStats, departmentStats] = await Promise.all([
    Appointment.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    Appointment.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'dept'
        }
      },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$dept.name', 'Unassigned'] },
          count: 1
        }
      }
    ])
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { statusStats, departmentStats },
      'Appointment report generated successfully'
    )
  );
});

export const getDemographicsReport = asyncHandler(async (req, res) => {
  const [bloodGroupStats, genderStats, totalPatients] = await Promise.all([
    Patient.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$bloodGroup',
          count: { $sum: 1 }
        }
      }
    ]),
    Patient.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]),
    Patient.countDocuments({ isActive: true })
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { bloodGroupStats, genderStats, totalPatients },
      'Demographics report generated successfully'
    )
  );
});
