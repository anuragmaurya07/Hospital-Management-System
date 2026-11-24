import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../services/hospitalApi';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  FaUserInjured,
  FaUserMd,
  FaCalendarCheck,
  FaDollarSign,
  FaHospital,
  FaExclamationTriangle,
  FaFlask,
  FaCalendarDay
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const PIE_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getAdmin();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading Executive Hospital Analytics..." />;
  }

  const kpis = data?.kpis || {};
  const monthlyRevenue = data?.monthlyRevenue || [];
  const departmentWorkload = data?.departmentWorkload || [];
  const recentAppointments = data?.recentAppointments || [];
  const recentPatients = data?.recentPatients || [];

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Hospital Executive Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Real-time clinical metrics, revenue performance, and facility operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/appointments"
            className="px-3.5 py-2 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors"
          >
            Manage Appointments
          </Link>
          <Link
            to="/billing"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors"
          >
            + Generate Invoice
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Patients"
          value={kpis.totalPatients || 0}
          icon={FaUserInjured}
          color="blue"
          subtitle="Lifetime hospital database"
        />
        <StatCard
          title="Today's Appointments"
          value={kpis.todayAppointments || 0}
          icon={FaCalendarDay}
          color="emerald"
          subtitle={`Total scheduled: ${kpis.totalAppointments || 0}`}
        />
        <StatCard
          title="Total Revenue Collected"
          value={formatCurrency(kpis.totalRevenue || 0)}
          icon={FaDollarSign}
          color="indigo"
          subtitle={`Pending: ${formatCurrency(kpis.pendingPayments || 0)}`}
        />
        <StatCard
          title="Active Doctors & Staff"
          value={`${kpis.totalDoctors || 0} / ${kpis.totalStaff || 0}`}
          icon={FaUserMd}
          color="purple"
          subtitle={`${kpis.totalDepartments || 0} clinical departments`}
        />
      </div>

      {/* Additional Alerts Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
              <FaExclamationTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold block">Pharmacy Low Stock Alert</span>
              <span className="text-xs text-amber-700">
                {kpis.lowStockMedicines || 0} medicines have reached or fallen below reorder threshold
              </span>
            </div>
          </div>
          <Link
            to="/pharmacy"
            className="text-xs font-semibold px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg transition-colors"
          >
            View Inventory &rarr;
          </Link>
        </div>

        <div className="flex items-center justify-between p-4 bg-sky-50 border border-sky-200 rounded-xl text-sky-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-100 text-sky-700 rounded-lg">
              <FaFlask className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold block">Laboratory Test Backlog</span>
              <span className="text-xs text-sky-700">
                {kpis.pendingLabTests || 0} diagnostic requests currently awaiting technician analysis
              </span>
            </div>
          </div>
          <Link
            to="/laboratory"
            className="text-xs font-semibold px-3 py-1.5 bg-sky-200 hover:bg-sky-300 text-sky-900 rounded-lg transition-colors"
          >
            Lab Queue &rarr;
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Revenue & Invoicing Trend</h3>
              <p className="text-xs text-slate-500">Collected Revenue vs Invoiced Amount</p>
            </div>
          </div>
          <div className="h-72 w-full">
            {monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} stroke="#cbd5e1" />
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val))}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="invoiced" name="Invoiced" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" name="Collected" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                No revenue trends available yet
              </div>
            )}
          </div>
        </div>

        {/* Department Workload Donut */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900">Department Workload</h3>
          <p className="text-xs text-slate-500 mb-4">Appointment volume distribution</p>
          <div className="h-72 w-full flex items-center justify-center">
            {departmentWorkload.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentWorkload}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {departmentWorkload.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val} visits`, 'Appointments']} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400">No appointments recorded</span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Appointments & Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Appointments</h3>
            <Link to="/appointments" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              View All &rarr;
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((apt: any) => (
                <div key={apt._id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {apt.patient?.name || 'Walk-in Patient'}
                    </span>
                    <span className="text-2xs text-slate-500">
                      With {apt.doctor?.user?.name || 'Doctor'} ({apt.department?.name}) • {apt.timeSlot}
                    </span>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={apt.status} />
                    <span className="text-2xs text-slate-400 block mt-0.5">
                      {formatDate(apt.appointmentDate)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No recent appointments</p>
            )}
          </div>
        </div>

        {/* Recent Registered Patients */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Patient Admissions</h3>
            <Link to="/patients" className="text-xs font-semibold text-primary-600 hover:text-primary-700">
              View All &rarr;
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentPatients.length > 0 ? (
              recentPatients.map((pat: any) => (
                <div key={pat._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {pat.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{pat.name}</span>
                      <span className="text-2xs text-slate-500">
                        {pat.patientId} • Blood: {pat.bloodGroup} • {pat.gender}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-600 font-medium block">{pat.phone}</span>
                    <span className="text-2xs text-slate-400 block">
                      Joined {formatDate(pat.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No recent patient registrations</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
