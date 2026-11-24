import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../services/hospitalApi';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { FaFlask, FaVial, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

export const LabDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLabDashboard();
  }, []);

  const fetchLabDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getLaboratory();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load lab dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading Laboratory Workstation..." />;
  }

  const kpis = data?.kpis || {};
  const urgentQueue = data?.urgentQueue || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Medical Diagnostic Laboratory
          </h1>
          <p className="text-sm text-slate-500">
            Process specimen tests, record biological parameters, and validate clinical reports
          </p>
        </div>
        <Link
          to="/laboratory"
          className="px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
        >
          <FaFlask className="w-3.5 h-3.5" /> All Laboratory Test Requests
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Awaiting Sample Collection"
          value={kpis.pendingTests || 0}
          icon={FaVial}
          color="amber"
          subtitle="Orders requiring phlebotomy"
        />
        <StatCard
          title="Under Laboratory Analysis"
          value={kpis.inProgressTests || 0}
          icon={FaFlask}
          color="blue"
          subtitle="Specimens currently in analyzer"
        />
        <StatCard
          title="Completed Today"
          value={kpis.completedToday || 0}
          icon={FaCheckCircle}
          color="emerald"
          subtitle="Reports validated and finalized"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaExclamationCircle className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900">High Priority & Urgent Test Queue</h3>
          </div>
          <span className="text-xs text-slate-500">{urgentQueue.length} Active Tests</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Test Number</th>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Test Name & Category</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {urgentQueue.length > 0 ? (
                urgentQueue.map((test: any) => (
                  <tr key={test._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-primary-700 text-xs">
                      {test.testNumber}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-semibold text-slate-900 block text-xs">
                        {test.patient?.name}
                      </span>
                      <span className="text-2xs text-slate-400">
                        {test.patient?.patientId} • {test.patient?.gender}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-medium text-slate-900 block">
                        {test.testName}
                      </span>
                      <span className="text-2xs text-slate-500">
                        {test.category} • Specimen: {test.sampleType}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-2xs font-bold px-2 py-0.5 rounded-full uppercase ${
                          test.priority === 'Urgent' || test.priority === 'Stat'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {test.priority}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={test.status} size="sm" />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => navigate('/laboratory')}
                        className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                      >
                        Enter Results
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-slate-400 text-xs">
                    No urgent tests currently in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
