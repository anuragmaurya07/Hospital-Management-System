import React, { useEffect, useState } from 'react';
import { pharmacyApi } from '../../services/hospitalApi';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { SearchInput } from '../../components/tables/SearchInput';
import { Modal } from '../../components/modals/Modal';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Medicine } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { FaPills, FaPlus, FaExclamationTriangle, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const PharmacyPage: React.FC = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });

  // Add Medicine Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Antibiotics',
    manufacturer: '',
    batchNumber: '',
    expiryDate: '2027-12-31',
    purchasePrice: 5,
    sellingPrice: 12,
    stockQuantity: 100,
    reorderLevel: 20,
    unit: 'Tablet',
    locationRack: 'Shelf A-01'
  });

  useEffect(() => {
    fetchMedicines(1);
  }, [categoryFilter, lowStockFilter]);

  const fetchMedicines = async (page: number = 1) => {
    try {
      setLoading(true);
      const params: any = { page, limit: 15 };
      if (categoryFilter) params.category = categoryFilter;
      if (lowStockFilter) params.lowStock = 'true';
      const res = await pharmacyApi.getAll(params);
      if (res.data.success) {
        setMedicines(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load pharmacy medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.batchNumber || !formData.expiryDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await pharmacyApi.create(formData);
      toast.success('Medicine cataloged successfully!');
      setIsAddModalOpen(false);
      fetchMedicines(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add medicine');
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(s) ||
      m.genericName?.toLowerCase().includes(s) ||
      m.batchNumber?.toLowerCase().includes(s) ||
      m.medicineId?.toLowerCase().includes(s)
    );
  });

  const columns: Column<Medicine>[] = [
    {
      header: 'Medicine SKU',
      accessor: 'medicineId',
      render: (m) => (
        <span className="font-bold text-xs text-primary-700">{m.medicineId}</span>
      ),
    },
    {
      header: 'Drug Name & Generic',
      render: (m) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{m.name}</span>
          <span className="text-2xs text-slate-400">{m.genericName || 'Formula'}</span>
        </div>
      ),
    },
    {
      header: 'Category & Rack',
      render: (m) => (
        <div>
          <span className="text-xs font-medium text-slate-800 block">{m.category}</span>
          <span className="text-2xs text-slate-400">{m.locationRack || 'Shelf'}</span>
        </div>
      ),
    },
    {
      header: 'Batch & Expiry',
      render: (m) => (
        <div>
          <span className="text-xs font-semibold text-slate-700 block">{m.batchNumber}</span>
          <span className="text-2xs text-slate-400">Exp: {formatDate(m.expiryDate)}</span>
        </div>
      ),
    },
    {
      header: 'Current Stock',
      render: (m) => {
        const isLow = m.stockQuantity <= m.reorderLevel;
        return (
          <div>
            <span
              className={`text-xs font-bold ${
                isLow ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {m.stockQuantity} {m.unit}s
            </span>
            {isLow && (
              <span className="block text-2xs font-bold text-rose-500 uppercase">
                Low Stock (Reorder: {m.reorderLevel})
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Price (Selling)',
      className: 'text-right',
      render: (m) => (
        <span className="font-bold text-slate-900 text-sm">
          {formatCurrency(m.sellingPrice)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Formulary & Pharmacy Catalog
          </h1>
          <p className="text-xs text-slate-500">
            Monitor hospital drug inventory, batch numbers, pricing, and reorder alerts
          </p>
        </div>
        {(user?.role === 'pharmacist' || user?.role === 'admin') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition-colors"
          >
            <FaPlus className="w-3.5 h-3.5" /> + Add Medicine SKU
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search drug by brand, generic name, batch number..."
          className="max-w-md"
        />

        <div className="flex items-center gap-2">
          <FaFilter className="text-slate-400 w-3.5 h-3.5" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
          >
            <option value="">All Categories</option>
            <option value="Antibiotics">Antibiotics</option>
            <option value="Cardiovascular">Cardiovascular</option>
            <option value="Analgesics">Analgesics</option>
            <option value="Antidiabetic">Antidiabetic</option>
            <option value="Gastrointestinal">Gastrointestinal</option>
            <option value="Respiratory">Respiratory</option>
          </select>

          <button
            type="button"
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              lowStockFilter
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FaExclamationTriangle className="w-3 h-3 text-rose-500" />
            Low Stock Only
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredMedicines}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchMedicines(p)}
        emptyTitle="No Medicines Cataloged"
        emptyDescription="Add pharmaceutical products to manage stock availability."
      />

      {/* Add Medicine Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Catalog Pharmaceutical Drug"
        subtitle="Add a new medication SKU with batch numbers and threshold quantities"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateMedicine} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Brand / Commercial Name"
              placeholder="e.g. Lipitor 20mg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <FormInput
              label="Generic Formula Name"
              placeholder="e.g. Atorvastatin Calcium"
              value={formData.genericName}
              onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormSelect
              label="Drug Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { label: 'Antibiotics', value: 'Antibiotics' },
                { label: 'Cardiovascular', value: 'Cardiovascular' },
                { label: 'Analgesics', value: 'Analgesics' },
                { label: 'Antidiabetic', value: 'Antidiabetic' },
                { label: 'Gastrointestinal', value: 'Gastrointestinal' },
                { label: 'Respiratory', value: 'Respiratory' },
                { label: 'Vitamins & Supplements', value: 'Vitamins & Supplements' },
                { label: 'Other', value: 'Other' }
              ]}
            />
            <FormInput
              label="Batch Number"
              placeholder="BAT-2026-09"
              value={formData.batchNumber}
              onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
              required
            />
            <FormInput
              label="Expiry Date"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <FormInput
              label="Purchase Cost ($)"
              type="number"
              step="0.01"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
            />
            <FormInput
              label="Selling Price ($)"
              type="number"
              step="0.01"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
              required
            />
            <FormInput
              label="Opening Stock"
              type="number"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
              required
            />
            <FormInput
              label="Reorder Level"
              type="number"
              value={formData.reorderLevel}
              onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Packaging Unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              options={[
                { label: 'Tablet', value: 'Tablet' },
                { label: 'Capsule', value: 'Capsule' },
                { label: 'Syrup Bottle', value: 'Syrup' },
                { label: 'Injection / Vial', value: 'Injection' },
                { label: 'Box', value: 'Box' },
                { label: 'Ointment', value: 'Ointment' }
              ]}
            />
            <FormInput
              label="Storage Location / Shelf Rack"
              placeholder="e.g. Shelf C-04"
              value={formData.locationRack}
              onChange={(e) => setFormData({ ...formData, locationRack: e.target.value })}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm"
            >
              Save Medicine SKU
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
