import React, { useEffect, useState } from 'react';
import { dashboardApi, appointmentApi } from '../../services/hospitalApi';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  FaCalendarCheck,
  FaUserPlus,
  FaCheckCircle,
  FaUserMd,
  FaClock
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const ReceptionistDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceptionDashboard();
  }, []);

  const fetchReceptionDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getReceptionist();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load receptionist dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    try {
      await appointmentApi.updateStatus(appointmentId, 'In-Consultation');
      toast.success('Patient checked in and doctor notified!');
      fetchReceptionDashboard();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading Front Desk Operations..." />;
  }

  const kpis = data?.kpis || {};
  const todayQueue = data?.todayQueue || [];
  const availableDoctors = data?.availableDoctors || [];

  return (
    <div className="space-y-6">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reception & Front Desk Portal
          </h1>
          <p className="text-sm text-slate-500">
            Fast patient check-in, walk-in registration, and appointment scheduling
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/patients"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <FaUserPlus className="w-3.5 h-3.5 text-primary-600" /> + Register Patient
          </Link>
          <Link
            to="/appointments"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <FaCalendarCheck className="w-3.5 h-3.5" /> Book Appointment
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Appointments"
          value={kpis.todayAppointments || 0}
          icon={FaCalendarCheck}
          color="blue"
          subtitle="Total schedule today"
        />
        <StatCard
          title="Checked-In Patients"
          value={kpis.checkedInPatients || 0}
          icon={FaCheckCircle}
          color="emerald"
          subtitle="Currently with doctor or done"
        />
        <StatCard
          title="Pending Arrivals"
          value={kpis.pendingArrivals || 0}
          icon={FaClock}
          color="amber"
          subtitle="Expected today"
        />
        <StatCard
          title="Doctors On Duty"
          value={kpis.availableDoctorsCount || 0}
          icon={FaUserMd}
          color="indigo"
          subtitle="Active consultation rooms"
        />
      </div>

      {/* Main Grid: Today's Queue & Available Doctors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Queue Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Today's Patient Arrivals Queue</h3>
            <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
              Live Flow
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Assigned Doctor</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayQueue.length > 0 ? (
                  todayQueue.map((apt: any) => (
                    <tr key={apt._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-primary-700 text-xs">
                        {apt.timeSlot}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-semibold text-slate-900 block text-xs">
                          {apt.patient?.name}
                        </span>
                        <span className="text-2xs text-slate-400">
                          {apt.patient?.patientId} • {apt.patient?.phone}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-xs font-medium text-slate-800 block">
                          {apt.doctor?.user?.name || 'Dr. Specialist'}
                        </span>
                        <span className="text-2xs text-slate-400">
                          {apt.department?.name}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={apt.status} size="sm" />
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {apt.status === 'Confirmed' || apt.status === 'Pending' ? (
                          <button
                            onClick={() => handleCheckIn(apt._id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                          >
                            Check-In
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Checked In</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-xs">
                      No appointments in queue for today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Available Doctors List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <h3 className="text-base font-bold text-slate-900 mb-1">Doctors On Duty Today</h3>
          <p className="text-xs text-slate-500 mb-4">Current clinical room assignments</p>

          <div className="space-y-3">
            {availableDoctors.map((doc: any) => (
              <div
                key={doc._id}
                className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {doc.user?.name}
                  </span>
                  <span className="text-2xs text-slate-500 block">
                    {doc.specialization} ({doc.department?.name})
                  </span>
                  <span className="text-2xs text-emerald-700 font-medium">
                    {doc.roomNumber} • {doc.workingHours?.start} - {doc.workingHours?.end}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 block">
                    ${doc.consultationFee}
                  </span>
                  <span className="text-2xs text-slate-400">fee</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
