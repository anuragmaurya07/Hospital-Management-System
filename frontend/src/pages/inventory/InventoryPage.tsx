import React, { useEffect, useState } from 'react';
import { inventoryApi } from '../../services/hospitalApi';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { SearchInput } from '../../components/tables/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/modals/Modal';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { InventoryItem } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { FaBoxes, FaPlus, FaDolly, FaWarehouse } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });

  // Add Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Consumables',
    quantity: 100,
    unit: 'Pieces',
    minRequiredQuantity: 20,
    unitCost: 2.5,
    storageLocation: 'Central Medical Supply Bay 1',
    supplierName: 'General MedSupply Co',
    supplierPhone: '+1 555-9000'
  });

  // Restock Modal
  const [activeItemForRestock, setActiveItemForRestock] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState(50);

  useEffect(() => {
    fetchInventory(1);
  }, [categoryFilter, statusFilter]);

  const fetchInventory = async (page: number = 1) => {
    try {
      setLoading(true);
      const params: any = { page, limit: 15 };
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await inventoryApi.getAll(params);
      if (res.data.success) {
        setItems(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load inventory assets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Item name is required');
      return;
    }

    try {
      await inventoryApi.create({
        name: formData.name,
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        minRequiredQuantity: Number(formData.minRequiredQuantity),
        unitCost: Number(formData.unitCost),
        storageLocation: formData.storageLocation,
        supplier: { name: formData.supplierName, phone: formData.supplierPhone }
      });
      toast.success('Inventory asset cataloged successfully!');
      setIsAddModalOpen(false);
      fetchInventory(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to catalog item');
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItemForRestock || restockQty <= 0) return;

    try {
      await inventoryApi.restock(activeItemForRestock._id, restockQty);
      toast.success(`Successfully restocked ${restockQty} ${activeItemForRestock.unit}!`);
      setActiveItemForRestock(null);
      fetchInventory(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to restock asset');
    }
  };

  const filtered = items.filter((i) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      i.name?.toLowerCase().includes(s) ||
      i.itemCode?.toLowerCase().includes(s) ||
      i.category?.toLowerCase().includes(s)
    );
  });

  const columns: Column<InventoryItem>[] = [
    {
      header: 'Item Code',
      accessor: 'itemCode',
      render: (i) => (
        <span className="font-bold text-xs text-primary-700">{i.itemCode}</span>
      ),
    },
    {
      header: 'Equipment / Asset',
      render: (i) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{i.name}</span>
          <span className="text-2xs text-slate-400">Supplier: {i.supplier?.name || 'In-House'}</span>
        </div>
      ),
    },
    {
      header: 'Category & Location',
      render: (i) => (
        <div>
          <span className="text-xs font-medium text-slate-800 block">{i.category}</span>
          <span className="text-2xs text-slate-400">{i.storageLocation}</span>
        </div>
      ),
    },
    {
      header: 'In Stock',
      render: (i) => (
        <span className="font-bold text-slate-900 text-xs">
          {i.quantity} {i.unit}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (i) => <StatusBadge status={i.status} size="sm" />,
    },
    {
      header: 'Unit Cost',
      className: 'text-right',
      render: (i) => (
        <span className="font-bold text-slate-900 text-xs">
          {formatCurrency(i.unitCost)}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (i) => (
        <button
          onClick={() => {
            setActiveItemForRestock(i);
            setRestockQty(i.minRequiredQuantity || 50);
          }}
          className="px-2.5 py-1 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors inline-flex items-center gap-1 shadow-2xs"
        >
          <FaDolly className="w-3 h-3" /> Restock
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Hospital Supplies & Equipment
          </h1>
          <p className="text-xs text-slate-500">
            Track consumables, PPE, surgical instruments, and medical hardware stock levels
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition-colors"
        >
          <FaPlus className="w-3.5 h-3.5" /> + Add Inventory Asset
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by equipment name, item code, category..."
          className="max-w-md"
        />

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
          >
            <option value="">All Categories</option>
            <option value="Medical Equipment">Medical Equipment</option>
            <option value="Surgical Instruments">Surgical Instruments</option>
            <option value="Consumables">Consumables</option>
            <option value="PPE">PPE</option>
            <option value="Laboratory Supplies">Laboratory Supplies</option>
            <option value="Bedding & Linen">Bedding & Linen</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
          >
            <option value="">All Stock Levels</option>
            <option value="In-Stock">In-Stock</option>
            <option value="Low-Stock">Low-Stock</option>
            <option value="Out-of-Stock">Out-of-Stock</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchInventory(p)}
        emptyTitle="No Inventory Assets Found"
        emptyDescription="Catalog hospital supplies to ensure minimum required thresholds are sustained."
      />

      {/* Restock Modal */}
      <Modal
        isOpen={!!activeItemForRestock}
        onClose={() => setActiveItemForRestock(null)}
        title="Restock Inventory Quantity"
        subtitle={`Item: ${activeItemForRestock?.name} (${activeItemForRestock?.itemCode})`}
        maxWidth="sm"
      >
        <form onSubmit={handleRestock} className="space-y-4">
          <FormInput
            label={`Quantity to Add (${activeItemForRestock?.unit})`}
            type="number"
            min="1"
            value={restockQty}
            onChange={(e) => setRestockQty(Number(e.target.value))}
            required
          />

          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
            <span>Current on hand: <strong>{activeItemForRestock?.quantity} {activeItemForRestock?.unit}</strong></span>
            <span className="block mt-1">New total will be: <strong>{(activeItemForRestock?.quantity || 0) + restockQty} {activeItemForRestock?.unit}</strong></span>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveItemForRestock(null)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm"
            >
              Confirm Restock
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Catalog New Hospital Asset"
        subtitle="Establish procurement tracking for medical equipment or consumables"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateItem} className="space-y-4">
          <FormInput
            label="Item Description Name"
            placeholder="e.g. Infusion Pump IV Stand"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Asset Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { label: 'Medical Equipment', value: 'Medical Equipment' },
                { label: 'Surgical Instruments', value: 'Surgical Instruments' },
                { label: 'Consumables', value: 'Consumables' },
                { label: 'PPE', value: 'PPE' },
                { label: 'Laboratory Supplies', value: 'Laboratory Supplies' },
                { label: 'Bedding & Linen', value: 'Bedding & Linen' },
                { label: 'Other', value: 'Other' }
              ]}
            />
            <FormInput
              label="Packaging Unit"
              placeholder="e.g. Pieces, Boxes, Rolls"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Initial Stock Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              required
            />
            <FormInput
              label="Min Threshold (Alert Level)"
              type="number"
              value={formData.minRequiredQuantity}
              onChange={(e) => setFormData({ ...formData, minRequiredQuantity: Number(e.target.value) })}
              required
            />
            <FormInput
              label="Estimated Unit Cost ($)"
              type="number"
              step="0.01"
              value={formData.unitCost}
              onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Storage Location"
              placeholder="e.g. Bay 2, Locker 4"
              value={formData.storageLocation}
              onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
            />
            <FormInput
              label="Supplier Vendor Name"
              placeholder="e.g. Global Medical Logistics"
              value={formData.supplierName}
              onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
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
              Catalog Asset
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
