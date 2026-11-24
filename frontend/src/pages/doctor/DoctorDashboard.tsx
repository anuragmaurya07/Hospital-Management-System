import React, { useEffect, useState } from 'react';
import { dashboardApi, appointmentApi } from '../../services/hospitalApi';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import {
  FaCalendarDay,
  FaCheckCircle,
  FaClock,
  FaUserInjured,
  FaNotesMedical,
  FaPrescriptionBottleAlt
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const DoctorDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctorDashboard();
  }, []);

  const fetchDoctorDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getDoctor();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await appointmentApi.updateStatus(id, status);
      toast.success(`Appointment status updated to ${status}`);
      fetchDoctorDashboard();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading Doctor Clinic Schedule..." />;
  }

  const kpis = data?.kpis || {};
  const todaySchedule = data?.todaySchedule || [];
  const upcomingAppointments = data?.upcomingAppointments || [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Doctor Clinical Portal
          </h1>
          <p className="text-sm text-slate-500">
            Manage your daily patient consultations, clinical notes, and treatment plans
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/medical-records"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <FaNotesMedical className="w-3.5 h-3.5 text-primary-600" /> Medical Records
          </Link>
          <Link
            to="/prescriptions"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <FaPrescriptionBottleAlt className="w-3.5 h-3.5" /> Prescriptions
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Appointments"
          value={kpis.todayAppointments || 0}
          icon={FaCalendarDay}
          color="blue"
          subtitle="Scheduled visits today"
        />
        <StatCard
          title="Pending Consultation"
          value={kpis.pendingAppointments || 0}
          icon={FaClock}
          color="amber"
          subtitle="Awaiting clinical review"
        />
        <StatCard
          title="Completed Visits"
          value={kpis.completedAppointments || 0}
          icon={FaCheckCircle}
          color="emerald"
          subtitle="Finished consultations"
        />
        <StatCard
          title="Total Consulted Patients"
          value={kpis.totalPatients || 0}
          icon={FaUserInjured}
          color="indigo"
          subtitle="Unique patient cases"
        />
      </div>

      {/* Today's Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today's Consultation Schedule</h3>
            <p className="text-xs text-slate-500">Patients booked for today in your clinic</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {todaySchedule.length} Patients Scheduled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Time Slot</th>
                <th className="px-6 py-3.5">Patient Details</th>
                <th className="px-6 py-3.5">Allergies & Blood</th>
                <th className="px-6 py-3.5">Visit Reason</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todaySchedule.length > 0 ? (
                todaySchedule.map((apt: any) => (
                  <tr key={apt._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary-700">
                      {apt.timeSlot}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900 block">
                        {apt.patient?.name}
                      </span>
                      <span className="text-2xs text-slate-400">
                        {apt.patient?.patientId} • {apt.patient?.gender} • {apt.patient?.phone}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700 mr-1.5">
                        {apt.patient?.bloodGroup || 'N/A'}
                      </span>
                      {apt.patient?.allergies?.length > 0 ? (
                        <span className="text-2xs text-rose-600 font-medium">
                          Allergic: {apt.patient.allergies.join(', ')}
                        </span>
                      ) : (
                        <span className="text-2xs text-slate-400">No allergies noted</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                      {apt.reason}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status === 'Confirmed' && (
                          <button
                            onClick={() => updateStatus(apt._id, 'In-Consultation')}
                            className="px-2.5 py-1 text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-2xs"
                          >
                            Start Visit
                          </button>
                        )}
                        {apt.status === 'In-Consultation' && (
                          <button
                            onClick={() => updateStatus(apt._id, 'Completed')}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-2xs"
                          >
                            Mark Done
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/patients/${apt.patient?._id}`)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          View History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-xs">
                    No appointments scheduled for today. Take a break!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Visits */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <h3 className="text-base font-bold text-slate-900 mb-3">Upcoming Consultations This Week</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((apt: any) => (
              <div
                key={apt._id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-primary-700">
                      {formatDate(apt.appointmentDate)} • {apt.timeSlot}
                    </span>
                    <StatusBadge status={apt.status} size="sm" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 block">
                    {apt.patient?.name}
                  </span>
                  <span className="text-2xs text-slate-500 block truncate mt-0.5">
                    {apt.reason}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 col-span-3 text-center py-4">
              No upcoming appointments later this week.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
