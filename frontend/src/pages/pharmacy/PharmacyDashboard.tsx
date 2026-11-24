import React, { useEffect, useState } from 'react';
import { dashboardApi, pharmacyApi } from '../../services/hospitalApi';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  FaPills,
  FaExclamationTriangle,
  FaHourglassHalf,
  FaFilePrescription,
  FaBoxes
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

export const PharmacyDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPharmaDashboard();
  }, []);

  const fetchPharmaDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getPharmacist();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load pharmacy dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading Pharmacy Inventory & Stock..." />;
  }

  const kpis = data?.kpis || {};
  const lowStockAlerts = data?.lowStockAlerts || [];
  const recentMedicines = data?.recentMedicines || [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pharmacy & Formulary Portal
          </h1>
          <p className="text-sm text-slate-500">
            Monitor hospital drug inventory, low stock thresholds, and dispense prescriptions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/prescriptions"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <FaFilePrescription className="w-3.5 h-3.5 text-primary-600" /> Dispense Queue
          </Link>
          <Link
            to="/pharmacy"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <FaPills className="w-3.5 h-3.5" /> Full Medicine Catalog
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Formulated Medicines"
          value={kpis.totalMedicines || 0}
          icon={FaPills}
          color="blue"
          subtitle="Active SKUs in pharmacy"
        />
        <StatCard
          title="Low Stock / Reorder Alerts"
          value={kpis.lowStockCount || 0}
          icon={FaExclamationTriangle}
          color="rose"
          subtitle="Inventory below safety stock"
        />
        <StatCard
          title="Pending Prescription Dispenses"
          value={kpis.pendingPrescriptions || 0}
          icon={FaHourglassHalf}
          color="amber"
          subtitle="Orders awaiting fulfillment"
        />
      </div>

      {/* Low Stock Warning Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <FaExclamationTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Critical Stock Replenishment Warnings</h3>
              <p className="text-2xs text-slate-500">Drugs requiring immediate purchase order placement</p>
            </div>
          </div>
          <Link
            to="/inventory"
            className="text-xs font-semibold text-rose-700 hover:text-rose-800"
          >
            Hospital Supplies &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Medicine</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Batch & Expiry</th>
                <th className="px-6 py-3">Current Stock</th>
                <th className="px-6 py-3">Reorder Point</th>
                <th className="px-6 py-3 text-right">Selling Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStockAlerts.length > 0 ? (
                lowStockAlerts.map((med: any) => (
                  <tr key={med._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      {med.name}
                      <span className="text-2xs text-slate-400 font-normal block">
                        {med.genericName} • {med.medicineId}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600">
                      {med.category}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600">
                      <span>{med.batchNumber}</span>
                      <span className="text-2xs text-slate-400 block">
                        Exp: {formatDate(med.expiryDate)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-rose-600">
                      {med.stockQuantity} {med.unit}s
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">
                      {med.reorderLevel} {med.unit}s
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold text-slate-900">
                      {formatCurrency(med.sellingPrice)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-slate-400 text-xs">
                    All medicines have healthy stock quantities above reorder levels.
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
