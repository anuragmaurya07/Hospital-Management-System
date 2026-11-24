import React, { useEffect, useState } from 'react';
import { reportsApi } from '../../services/hospitalApi';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import {
  FaDollarSign,
  FaFileInvoiceDollar,
  FaCalendarCheck,
  FaUserFriends,
  FaPrint,
  FaFilter
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
import toast from 'react-hot-toast';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export const ReportsPage: React.FC = () => {
  const [financialData, setFinancialData] = useState<any>(null);
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [demographicsData, setDemographicsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [fRes, aRes, dRes] = await Promise.all([
        reportsApi.getFinancial(params),
        reportsApi.getAppointments(params),
        reportsApi.getDemographics()
      ]);

      if (fRes.data.success) setFinancialData(fRes.data.data);
      if (aRes.data.success) setAppointmentData(aRes.data.data);
      if (dRes.data.success) setDemographicsData(dRes.data.data);
    } catch (err) {
      toast.error('Failed to aggregate hospital analytics');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Generating Executive Analytical Reports..." />;
  }

  const fSummary = financialData?.summary || {};
  const paymentsByMethod = (financialData?.paymentsByMethod || []).map((p: any) => ({
    name: p._id || 'Direct',
    amount: p.totalAmount,
    count: p.count
  }));

  const deptStats = (appointmentData?.departmentStats || []).map((d: any) => ({
    name: d.name,
    count: d.count
  }));

  const bloodGroupStats = (demographicsData?.bloodGroupStats || []).map((b: any) => ({
    name: b._id || 'Unknown',
    count: b.count
  }));

  const genderStats = (demographicsData?.genderStats || []).map((g: any) => ({
    name: g._id || 'Other',
    count: g.count
  }));

  return (
    <div className="space-y-6 printable-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reports & Analytical Intelligence
          </h1>
          <p className="text-xs text-slate-500">
            Hospital financial disclosures, demographic breakdowns, and department utilization
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="no-print inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors"
        >
          <FaPrint className="w-3.5 h-3.5 text-slate-500" /> Export / Print Report
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <FaFilter className="text-slate-400" />
          <span>Filter Report Period:</span>
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="text-xs p-2 border border-slate-200 rounded-lg bg-white"
        />
        <span className="text-xs text-slate-400">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="text-xs p-2 border border-slate-200 rounded-lg bg-white"
        />
        <button
          onClick={fetchReports}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
        >
          Apply Filter
        </button>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invoiced"
          value={formatCurrency(fSummary.totalInvoiced || 0)}
          icon={FaFileInvoiceDollar}
          color="blue"
          subtitle={`${fSummary.invoiceCount || 0} bills generated`}
        />
        <StatCard
          title="Total Collected Revenue"
          value={formatCurrency(fSummary.totalCollected || 0)}
          icon={FaDollarSign}
          color="emerald"
          subtitle="Net funds realized"
        />
        <StatCard
          title="Outstanding Balances"
          value={formatCurrency(fSummary.totalOutstanding || 0)}
          icon={FaFileInvoiceDollar}
          color="rose"
          subtitle="Unpaid patient accounts"
        />
        <StatCard
          title="Tax Collected"
          value={formatCurrency(fSummary.totalTax || 0)}
          icon={FaDollarSign}
          color="indigo"
          subtitle="Hospital service tax"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Channels */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Payment Method Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Realized revenues categorized by payment gateway</p>
          <div className="h-64 w-full">
            {paymentsByMethod.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentsByMethod}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                  <Bar dataKey="amount" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No payments recorded for this time window
              </div>
            )}
          </div>
        </div>

        {/* Department Utilization */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Department Consultation Volume</h3>
          <p className="text-xs text-slate-500 mb-4">Patient appointments per medical department</p>
          <div className="h-64 w-full flex items-center justify-center">
            {deptStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptStats}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {deptStats.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400">No appointments recorded</span>
            )}
          </div>
        </div>
      </div>

      {/* Patient Demographics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Groups */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Patient Blood Group Inventory</h3>
          <p className="text-xs text-slate-500 mb-4">Registered patient blood distribution</p>
          <div className="grid grid-cols-4 gap-2.5">
            {bloodGroupStats.map((bg: any) => (
              <div key={bg.name} className="p-3 bg-slate-50 rounded-lg text-center border border-slate-200/80">
                <span className="text-base font-extrabold text-primary-700 block">{bg.name}</span>
                <span className="text-2xs text-slate-500 font-medium">{bg.count} Patients</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Demographics */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Gender Demographics</h3>
          <p className="text-xs text-slate-500 mb-4">Patient population breakdown</p>
          <div className="grid grid-cols-3 gap-3">
            {genderStats.map((g: any) => (
              <div key={g.name} className="p-4 bg-slate-50 rounded-xl text-center border border-slate-200/80">
                <span className="text-2xs text-slate-400 uppercase font-bold block">{g.name}</span>
                <span className="text-2xl font-bold text-slate-900 block my-1">{g.count}</span>
                <span className="text-2xs text-slate-500">Admissions</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
