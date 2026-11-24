import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.model.js';
import Patient from '../models/Patient.model.js';
import Doctor from '../models/Doctor.model.js';
import Staff from '../models/Staff.model.js';
import Appointment from '../models/Appointment.model.js';
import Billing from '../models/Billing.model.js';
import Medicine from '../models/Medicine.model.js';
import LabTest from '../models/LabTest.model.js';
import Prescription from '../models/Prescription.model.js';
import Department from '../models/Department.model.js';
import dayjs from 'dayjs';

export const getAdminDashboard = asyncHandler(async (req, res) => {
  const todayStart = dayjs().startOf('day').toDate();
  const todayEnd = dayjs().endOf('day').toDate();

  // Basic KPI Counts
  const [
    totalPatients,
    totalDoctors,
    totalStaff,
    totalAppointments,
    todayAppointments,
    totalDepartments,
    revenueData,
    lowStockMedicines,
    pendingLabTests
  ] = await Promise.all([
    Patient.countDocuments({ isActive: true }),
    Doctor.countDocuments({ isActive: true }),
    Staff.countDocuments({ status: 'Active' }),
    Appointment.countDocuments(),
    Appointment.countDocuments({
      appointmentDate: { $gte: todayStart, $lte: todayEnd }
    }),
    Department.countDocuments({ isActive: true }),
    Billing.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$paidAmount' },
          pendingAmount: { $sum: '$balanceAmount' },
          totalInvoiced: { $sum: '$totalAmount' }
        }
      }
    ]),
    Medicine.countDocuments({
      $expr: { $lte: ['$stockQuantity', '$reorderLevel'] }
    }),
    LabTest.countDocuments({ status: { $in: ['Requested', 'In-Progress'] } })
  ]);

  // Monthly Revenue for last 6 months
  const sixMonthsAgo = dayjs().subtract(5, 'month').startOf('month').toDate();
  const monthlyRevenue = await Billing.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        },
        revenue: { $sum: '$paidAmount' },
        invoiced: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedMonthlyRevenue = monthlyRevenue.map((item) => ({
    name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    revenue: item.revenue,
    invoiced: item.invoiced
  }));

  // Appointment Status Breakdown
  const appointmentStats = await Appointment.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Department Distribution
  const departmentWorkload = await Appointment.aggregate([
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
        as: 'deptInfo'
      }
    },
    {
      $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        name: { $ifNull: ['$deptInfo.name', 'General'] },
        count: 1
      }
    }
  ]);

  // Recent Appointments
  const recentAppointments = await Appointment.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('patient', 'name patientId phone')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    })
    .populate('department', 'name');

  // Recent Patients
  const recentPatients = await Patient.find()
    .sort({ createdAt: -1 })
    .limit(5);

  const kpis = {
    totalPatients,
    totalDoctors,
    totalStaff,
    totalAppointments,
    todayAppointments,
    totalDepartments,
    totalRevenue: revenueData[0]?.totalRevenue || 0,
    pendingPayments: revenueData[0]?.pendingAmount || 0,
    lowStockMedicines,
    pendingLabTests
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        kpis,
        monthlyRevenue: formattedMonthlyRevenue,
        appointmentStats,
        departmentWorkload,
        recentAppointments,
        recentPatients
      },
      'Admin dashboard data retrieved successfully'
    )
  );
});

export const getDoctorDashboard = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return res.status(200).json(
      new ApiResponse(200, {
        kpis: { todayAppointments: 0, pendingAppointments: 0, completedAppointments: 0, totalPatients: 0 },
        todaySchedule: [],
        upcomingAppointments: []
      })
    );
  }

  const todayStart = dayjs().startOf('day').toDate();
  const todayEnd = dayjs().endOf('day').toDate();

  const [todayAppointmentsCount, pendingCount, completedCount, distinctPatients] =
    await Promise.all([
      Appointment.countDocuments({
        doctor: doctor._id,
        appointmentDate: { $gte: todayStart, $lte: todayEnd }
      }),
      Appointment.countDocuments({
        doctor: doctor._id,
        status: { $in: ['Pending', 'Confirmed'] }
      }),
      Appointment.countDocuments({
        doctor: doctor._id,
        status: 'Completed'
      }),
      Appointment.distinct('patient', { doctor: doctor._id })
    ]);

  const todaySchedule = await Appointment.find({
    doctor: doctor._id,
    appointmentDate: { $gte: todayStart, $lte: todayEnd }
  })
    .sort({ timeSlot: 1 })
    .populate('patient', 'name patientId phone gender bloodGroup allergies');

  const upcomingAppointments = await Appointment.find({
    doctor: doctor._id,
    appointmentDate: { $gt: todayEnd },
    status: { $in: ['Pending', 'Confirmed'] }
  })
    .sort({ appointmentDate: 1 })
    .limit(6)
    .populate('patient', 'name patientId phone');

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        kpis: {
          todayAppointments: todayAppointmentsCount,
          pendingAppointments: pendingCount,
          completedAppointments: completedCount,
          totalPatients: distinctPatients.length
        },
        todaySchedule,
        upcomingAppointments
      },
      'Doctor dashboard retrieved successfully'
    )
  );
});

export const getPatientDashboard = asyncHandler(async (req, res) => {
  let patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    patient = await Patient.findOne({ email: req.user.email });
  }

  if (!patient) {
    return res.status(200).json(
      new ApiResponse(200, {
        kpis: { upcomingAppointments: 0, totalPrescriptions: 0, pendingLabReports: 0, outstandingBills: 0 },
        upcomingAppointments: [],
        recentPrescriptions: [],
        recentLabTests: [],
        invoices: []
      })
    );
  }

  const now = new Date();

  const [
    upcomingAppointments,
    pastAppointmentsCount,
    prescriptions,
    labTests,
    invoices
  ] = await Promise.all([
    Appointment.find({
      patient: patient._id,
      appointmentDate: { $gte: dayjs().startOf('day').toDate() },
      status: { $nin: ['Cancelled', 'Completed'] }
    })
      .sort({ appointmentDate: 1 })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      })
      .populate('department', 'name'),
    Appointment.countDocuments({
      patient: patient._id,
      status: 'Completed'
    }),
    Prescription.find({ patient: patient._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      }),
    LabTest.find({ patient: patient._id })
      .sort({ createdAt: -1 })
      .limit(5),
    Billing.find({ patient: patient._id })
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  const outstandingBills = invoices.filter((b) => b.paymentStatus !== 'Paid').length;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        kpis: {
          upcomingAppointments: upcomingAppointments.length,
          completedVisits: pastAppointmentsCount,
          totalPrescriptions: prescriptions.length,
          outstandingBills
        },
        patient,
        upcomingAppointments,
        recentPrescriptions: prescriptions,
        recentLabTests: labTests,
        invoices
      },
      'Patient dashboard retrieved successfully'
    )
  );
});

export const getReceptionistDashboard = asyncHandler(async (req, res) => {
  const todayStart = dayjs().startOf('day').toDate();
  const todayEnd = dayjs().endOf('day').toDate();

  const [
    todayTotal,
    checkedIn,
    pendingToday,
    totalPatientsRegistered,
    availableDoctors
  ] = await Promise.all([
    Appointment.countDocuments({
      appointmentDate: { $gte: todayStart, $lte: todayEnd }
    }),
    Appointment.countDocuments({
      appointmentDate: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['In-Consultation', 'Completed'] }
    }),
    Appointment.countDocuments({
      appointmentDate: { $gte: todayStart, $lte: todayEnd },
      status: 'Pending'
    }),
    Patient.countDocuments(),
    Doctor.find({ isActive: true })
      .populate('user', 'name phone')
      .populate('department', 'name')
  ]);

  const todayQueue = await Appointment.find({
    appointmentDate: { $gte: todayStart, $lte: todayEnd }
  })
    .sort({ timeSlot: 1 })
    .populate('patient', 'name patientId phone')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    })
    .populate('department', 'name');

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        kpis: {
          todayAppointments: todayTotal,
          checkedInPatients: checkedIn,
          pendingArrivals: pendingToday,
          totalPatientsRegistered,
          availableDoctorsCount: availableDoctors.length
        },
        todayQueue,
        availableDoctors
      },
      'Receptionist dashboard retrieved successfully'
    )
  );
});

export const getPharmacistDashboard = asyncHandler(async (req, res) => {
  const [totalMedicines, lowStockCount, pendingPrescriptions, recentMedicines] =
    await Promise.all([
      Medicine.countDocuments({ isActive: true }),
      Medicine.countDocuments({
        $expr: { $lte: ['$stockQuantity', '$reorderLevel'] }
      }),
      Prescription.countDocuments({ status: 'Issued' }),
      Medicine.find({ isActive: true })
        .sort({ stockQuantity: 1 })
        .limit(10)
    ]);

  const lowStockAlerts = await Medicine.find({
    $expr: { $lte: ['$stockQuantity', '$reorderLevel'] }
  }).limit(10);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        kpis: {
          totalMedicines,
          lowStockCount,
          pendingPrescriptions
        },
        lowStockAlerts,
        recentMedicines
      },
      'Pharmacist dashboard retrieved successfully'
    )
  );
});

export const getLabDashboard = asyncHandler(async (req, res) => {
  const [pendingTests, inProgressTests, completedToday] = await Promise.all([
    LabTest.countDocuments({ status: 'Requested' }),
    LabTest.countDocuments({ status: 'In-Progress' }),
    LabTest.countDocuments({
      status: 'Completed',
      completedDate: {
        $gte: dayjs().startOf('day').toDate(),
        $lte: dayjs().endOf('day').toDate()
      }
    })
  ]);

  const urgentQueue = await LabTest.find({
    status: { $in: ['Requested', 'In-Progress'] }
  })
    .sort({ priority: -1, createdAt: 1 })
    .limit(10)
    .populate('patient', 'name patientId gender')
    .populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        kpis: {
          pendingTests,
          inProgressTests,
          completedToday
        },
        urgentQueue
      },
      'Laboratory dashboard retrieved successfully'
    )
  );
});
