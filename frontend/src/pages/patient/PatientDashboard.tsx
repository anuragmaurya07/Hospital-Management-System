import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../services/hospitalApi';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  FaCalendarAlt,
  FaFilePrescription,
  FaFlask,
  FaFileInvoiceDollar,
  FaHeartbeat,
  FaShieldAlt,
  FaPhoneAlt
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

export const PatientDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientDashboard();
  }, []);

  const fetchPatientDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getPatient();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading Your Personal Health Portal..." />;
  }

  const kpis = data?.kpis || {};
  const patient = data?.patient || {};
  const upcomingAppointments = data?.upcomingAppointments || [];
  const recentPrescriptions = data?.recentPrescriptions || [];
  const recentLabTests = data?.recentLabTests || [];
  const invoices = data?.invoices || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Health Profile Summary */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-800 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-primary-200 text-xs font-bold uppercase tracking-wider block mb-1">
              Patient Portal • ID: {patient.patientId || 'PAT-DEMO'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {patient.name || 'Valued Patient'}
            </h1>
            <p className="mt-1 text-primary-100 text-xs sm:text-sm max-w-xl">
              Access your medical records, check upcoming appointments, review lab reports, and manage pharmacy prescriptions in real time.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/appointments/book"
              className="px-4 py-2.5 bg-white text-primary-700 font-bold rounded-xl text-xs shadow-md hover:bg-primary-50 transition-colors"
            >
              + Book New Appointment
            </Link>
          </div>
        </div>

        {/* Quick Health Stats in Banner */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-primary-500/50 text-xs">
          <div>
            <span className="text-primary-200 block text-2xs">Blood Type</span>
            <span className="font-bold text-sm text-white">{patient.bloodGroup || 'Unknown'}</span>
          </div>
          <div>
            <span className="text-primary-200 block text-2xs">Emergency Contact</span>
            <span className="font-bold text-sm text-white truncate block">
              {patient.emergencyContact?.name || 'N/A'} ({patient.emergencyContact?.phone || 'N/A'})
            </span>
          </div>
          <div>
            <span className="text-primary-200 block text-2xs">Allergies</span>
            <span className="font-bold text-sm text-rose-200 truncate block">
              {patient.allergies?.length > 0 ? patient.allergies.join(', ') : 'None registered'}
            </span>
          </div>
          <div>
            <span className="text-primary-200 block text-2xs">Insurance Coverage</span>
            <span className="font-bold text-sm text-white truncate block">
              {patient.insurance?.provider ? `${patient.insurance.provider}` : 'Self-Pay'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Upcoming Appointments"
          value={kpis.upcomingAppointments || 0}
          icon={FaCalendarAlt}
          color="blue"
          subtitle="Scheduled doctor consultations"
        />
        <StatCard
          title="Past Visits Completed"
          value={kpis.completedVisits || 0}
          icon={FaHeartbeat}
          color="emerald"
          subtitle="Clinical history records"
        />
        <StatCard
          title="Active Prescriptions"
          value={kpis.totalPrescriptions || 0}
          icon={FaFilePrescription}
          color="indigo"
          subtitle="Medications issued by doctors"
        />
        <StatCard
          title="Pending Invoices"
          value={kpis.outstandingBills || 0}
          icon={FaFileInvoiceDollar}
          color="rose"
          subtitle="Outstanding hospital dues"
        />
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Your Upcoming Consultations</h3>
            <Link to="/appointments" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              View All &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt: any) => (
                <div
                  key={apt._id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary-700">
                        {formatDate(apt.appointmentDate)} at {apt.timeSlot}
                      </span>
                      <StatusBadge status={apt.status} size="sm" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 block">
                      {apt.doctor?.user?.name || 'Dr. Specialist'}
                    </span>
                    <span className="text-2xs text-slate-500 block">
                      Department of {apt.department?.name} • Reason: {apt.reason}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">${apt.fee}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                No upcoming appointments. Need care?{' '}
                <Link to="/appointments/book" className="text-primary-600 font-semibold underline">
                  Book now
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Prescriptions & Medications */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Prescriptions</h3>
            <Link to="/prescriptions" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              View All &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {recentPrescriptions.length > 0 ? (
              recentPrescriptions.map((rx: any) => (
                <div key={rx._id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">
                      {rx.prescriptionNumber} • Prescribed by {rx.doctor?.user?.name}
                    </span>
                    <StatusBadge status={rx.status} size="sm" />
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 mb-2">
                    {rx.medicines?.map((m: any, idx: number) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span className="font-medium text-slate-800">• {m.name}</span>
                        <span className="text-2xs text-slate-500">{m.dosage} ({m.frequency})</span>
                      </li>
                    ))}
                  </ul>
                  {rx.generalAdvice && (
                    <p className="text-2xs text-slate-400 italic">Advice: {rx.generalAdvice}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No prescriptions on record</p>
            )}
          </div>
        </div>
      </div>

      {/* Invoices & Lab Reports Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lab Reports */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Diagnostic Laboratory Reports</h3>
            <Link to="/laboratory" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              View All &rarr;
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentLabTests.length > 0 ? (
              recentLabTests.map((test: any) => (
                <div key={test._id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{test.testName}</span>
                    <span className="text-2xs text-slate-500">
                      Sample: {test.sampleType} • Category: {test.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={test.status} size="sm" />
                    <span className="text-2xs text-slate-400 block mt-0.5">
                      {formatDate(test.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No lab tests requested yet</p>
            )}
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Billing Invoices</h3>
            <Link to="/billing" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              Billing History &rarr;
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {invoices.length > 0 ? (
              invoices.map((inv: any) => (
                <div key={inv._id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{inv.invoiceNumber}</span>
                    <span className="text-2xs text-slate-500">
                      Total: {formatCurrency(inv.totalAmount)} • Paid: {formatCurrency(inv.paidAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={inv.paymentStatus} size="sm" />
                    {inv.paymentStatus !== 'Paid' && (
                      <span className="text-2xs text-rose-600 font-bold block mt-0.5">
                        Due: {formatCurrency(inv.balanceAmount)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No billing invoices found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
