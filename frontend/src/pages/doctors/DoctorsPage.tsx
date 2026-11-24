import React, { useEffect, useState } from 'react';
import { doctorApi, departmentApi } from '../../services/hospitalApi';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { SearchInput } from '../../components/tables/SearchInput';
import { Modal } from '../../components/modals/Modal';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { FormTextarea } from '../../components/forms/FormTextarea';
import { formatCurrency } from '../../utils/formatters';
import type { Doctor, Department } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { FaUserMd, FaHospital, FaClock, FaCalendarAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const DoctorsPage: React.FC = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Add Doctor Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Doctor@123',
    phone: '',
    department: '',
    specialization: '',
    qualification: 'MBBS, MD',
    experienceYears: 5,
    consultationFee: 100,
    roomNumber: 'Room 101',
    biography: ''
  });

  useEffect(() => {
    fetchDoctors();
    loadDepartments();
  }, [selectedDept]);

  const loadDepartments = async () => {
    try {
      const res = await departmentApi.getAll();
      if (res.data.success) setDepartments(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await doctorApi.getAll(selectedDept ? { department: selectedDept } : undefined);
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load doctor directory');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.department || !formData.specialization) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      await doctorApi.create(formData);
      toast.success('Physician enrolled successfully!');
      setIsAddModalOpen(false);
      fetchDoctors();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to enroll doctor');
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      doc.user?.name?.toLowerCase().includes(s) ||
      doc.specialization?.toLowerCase().includes(s) ||
      doc.department?.name?.toLowerCase().includes(s) ||
      doc.doctorId?.toLowerCase().includes(s)
    );
  });

  const columns: Column<Doctor>[] = [
    {
      header: 'Physician',
      render: (d) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
            {d.user?.name?.charAt(0)}
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-xs">{d.user?.name}</span>
            <span className="text-2xs text-slate-400">{d.doctorId} • {d.qualification}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Specialization & Department',
      render: (d) => (
        <div>
          <span className="font-semibold text-slate-800 block text-xs">{d.specialization}</span>
          <span className="text-2xs text-slate-500">{d.department?.name}</span>
        </div>
      ),
    },
    {
      header: 'Experience',
      render: (d) => (
        <span className="text-xs text-slate-700 font-medium">
          {d.experienceYears} Years Practice
        </span>
      ),
    },
    {
      header: 'Clinical Room',
      render: (d) => (
        <span className="text-xs text-slate-700 font-medium">
          {d.roomNumber}
        </span>
      ),
    },
    {
      header: 'Working Hours',
      render: (d) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 block">
            {d.workingHours?.start} - {d.workingHours?.end}
          </span>
          <span className="text-2xs text-slate-400">
            {d.availableDays?.length || 5} days/week
          </span>
        </div>
      ),
    },
    {
      header: 'Fee',
      className: 'text-right',
      render: (d) => (
        <span className="font-bold text-slate-900 text-sm">
          {formatCurrency(d.consultationFee)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Medical Staff & Doctors
          </h1>
          <p className="text-xs text-slate-500">
            Clinical specialists, consult fees, working hours, and departmental affiliations
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition-colors"
          >
            <FaUserMd className="w-3.5 h-3.5" /> + Enroll New Doctor
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search doctor by name, specialty, or room..."
          className="max-w-md"
        />

        <div className="flex items-center gap-2">
          <FaHospital className="text-slate-400 w-3.5 h-3.5" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
          >
            <option value="">All Clinical Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredDoctors}
        isLoading={loading}
        emptyTitle="No Doctors Listed"
        emptyDescription="No physicians found matching your criteria."
      />

      {/* Enroll Doctor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll New Medical Specialist"
        subtitle="Create physician profile and clinical availability"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateDoctor} className="space-y-4">
          <FormInput
            label="Doctor's Full Name"
            placeholder="e.g. Dr. Julian Bashir"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="doctor@hospital.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <FormInput
              label="Phone Number"
              placeholder="+1 555-0188"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={[
                { label: '-- Select Department --', value: '' },
                ...departments.map((d) => ({ label: d.name, value: d._id })),
              ]}
              required
            />
            <FormInput
              label="Specialization"
              placeholder="e.g. Pediatric Cardiology"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Qualification"
              placeholder="MBBS, MD"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            />
            <FormInput
              label="Experience (Years)"
              type="number"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
            />
            <FormInput
              label="Consultation Fee ($)"
              type="number"
              value={formData.consultationFee}
              onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
              required
            />
          </div>

          <FormInput
            label="Clinic / Room Number"
            placeholder="e.g. Suite 305, West Wing"
            value={formData.roomNumber}
            onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
          />

          <FormTextarea
            label="Biography & Clinical Focus"
            placeholder="Physician expertise and academic background..."
            value={formData.biography}
            onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
            rows={2}
          />

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
              Enroll Doctor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
