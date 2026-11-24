import React, { useEffect, useState } from 'react';
import { staffApi, departmentApi } from '../../services/hospitalApi';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { SearchInput } from '../../components/tables/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/modals/Modal';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Staff, Department } from '../../types';
import { FaUserShield, FaPlus, FaHospital } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const StaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });

  // Add Staff Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Staff@123',
    phone: '',
    role: 'receptionist',
    department: '',
    designation: 'Patient Services Coordinator',
    shift: 'Morning',
    qualification: 'Bachelor of Healthcare Admin',
    salary: 45000
  });

  useEffect(() => {
    fetchStaff(1);
    loadDepartments();
  }, [shiftFilter, statusFilter]);

  const loadDepartments = async () => {
    try {
      const res = await departmentApi.getAll();
      if (res.data.success) setDepartments(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStaff = async (page: number = 1) => {
    try {
      setLoading(true);
      const params: any = { page, limit: 15 };
      if (shiftFilter) params.shift = shiftFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await staffApi.getAll(params);
      if (res.data.success) {
        setStaffList(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load hospital staff directory');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.designation) {
      toast.error('Name, email, and designation are required');
      return;
    }

    try {
      await staffApi.create(formData);
      toast.success('Staff member registered successfully!');
      setIsAddModalOpen(false);
      fetchStaff(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register staff');
    }
  };

  const filtered = staffList.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.user?.name?.toLowerCase().includes(q) ||
      s.designation?.toLowerCase().includes(q) ||
      s.staffId?.toLowerCase().includes(q) ||
      s.user?.email?.toLowerCase().includes(q)
    );
  });

  const columns: Column<Staff>[] = [
    {
      header: 'Staff ID',
      accessor: 'staffId',
      render: (s) => (
        <span className="font-bold text-xs text-primary-700">{s.staffId}</span>
      ),
    },
    {
      header: 'Employee Name & Contact',
      render: (s) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{s.user?.name}</span>
          <span className="text-2xs text-slate-400">
            {s.user?.email} • {s.user?.phone || 'No phone'}
          </span>
        </div>
      ),
    },
    {
      header: 'Designation & Dept',
      render: (s) => (
        <div>
          <span className="font-semibold text-slate-800 block text-xs">{s.designation}</span>
          <span className="text-2xs text-slate-500">{s.department?.name || 'Administrative'}</span>
        </div>
      ),
    },
    {
      header: 'Shift',
      render: (s) => (
        <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-slate-100 text-slate-700">
          {s.shift} Shift
        </span>
      ),
    },
    {
      header: 'Status',
      render: (s) => <StatusBadge status={s.status} size="sm" />,
    },
    {
      header: 'Salary',
      className: 'text-right',
      render: (s) => (
        <span className="font-bold text-slate-900 text-xs">
          {formatCurrency(s.salary || 0)} / yr
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Hospital Staff Management
          </h1>
          <p className="text-xs text-slate-500">
            Operational personnel, department assignments, work shifts, and payroll records
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition-colors"
        >
          <FaPlus className="w-3.5 h-3.5" /> + Onboard Staff Member
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search staff by name, designation, or ID..."
          className="max-w-md"
        />

        <div className="flex items-center gap-2">
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
          >
            <option value="">All Shifts</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
            <option value="Rotational">Rotational</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On-Leave">On Leave</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchStaff(p)}
        emptyTitle="No Staff Members Found"
        emptyDescription="Hospital staff members will be cataloged here once registered."
      />

      {/* Onboard Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard Hospital Staff Member"
        subtitle="Create user credentials and assign department shift"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Employee Name"
              placeholder="e.g. Ronald Weasley"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <FormInput
              label="Email Address"
              type="email"
              placeholder="staff@hospital.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormSelect
              label="System User Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { label: 'Receptionist', value: 'receptionist' },
                { label: 'Pharmacist', value: 'pharmacist' },
                { label: 'Laboratory Tech', value: 'lab_technician' },
                { label: 'Administrator', value: 'admin' },
              ]}
            />
            <FormSelect
              label="Assigned Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={[
                { label: '-- General / Ops --', value: '' },
                ...departments.map((d) => ({ label: d.name, value: d._id })),
              ]}
            />
            <FormSelect
              label="Working Shift"
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
              options={[
                { label: 'Morning Shift', value: 'Morning' },
                { label: 'Evening Shift', value: 'Evening' },
                { label: 'Night Shift', value: 'Night' },
                { label: 'Rotational', value: 'Rotational' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Job Designation"
              placeholder="e.g. Head Nurse"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              required
            />
            <FormInput
              label="Phone"
              placeholder="+1 555-0199"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <FormInput
              label="Annual Salary ($)"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
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
              Register Staff Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
