import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../../services/hospitalApi';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { SearchInput } from '../../components/tables/SearchInput';
import { Modal } from '../../components/modals/Modal';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { FormTextarea } from '../../components/forms/FormTextarea';
import { formatDate } from '../../utils/formatters';
import type { Patient } from '../../types';
import { FaUserPlus, FaFilter, FaFileMedical } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });

  // Add Patient Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '1990-01-01',
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: '',
    chronicConditions: '',
    street: '',
    city: '',
    emergencyName: '',
    emergencyPhone: ''
  });

  useEffect(() => {
    fetchPatients(1);
  }, [bloodGroupFilter, genderFilter]);

  const fetchPatients = async (page: number = 1) => {
    try {
      setLoading(true);
      const params: any = { page, limit: 15 };
      if (bloodGroupFilter) params.bloodGroup = bloodGroupFilter;
      if (genderFilter) params.gender = genderFilter;
      const res = await patientApi.getAll(params);
      if (res.data.success) {
        setPatients(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load patients list');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
        chronicConditions: formData.chronicConditions ? formData.chronicConditions.split(',').map((s) => s.trim()) : [],
        address: { street: formData.street, city: formData.city },
        emergencyContact: { name: formData.emergencyName, phone: formData.emergencyPhone }
      };

      await patientApi.create(payload);
      toast.success('Patient registered successfully!');
      setIsModalOpen(false);
      fetchPatients(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register patient');
    }
  };

  const filteredPatients = patients.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(s) ||
      p.patientId?.toLowerCase().includes(s) ||
      p.phone?.toLowerCase().includes(s) ||
      p.email?.toLowerCase().includes(s)
    );
  });

  const columns: Column<Patient>[] = [
    {
      header: 'Patient ID',
      accessor: 'patientId',
      render: (p) => (
        <span className="font-bold text-xs text-primary-700">{p.patientId}</span>
      ),
    },
    {
      header: 'Patient Name & Contact',
      render: (p) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{p.name}</span>
          <span className="text-2xs text-slate-500">
            {p.phone} • {p.email || 'No email registered'}
          </span>
        </div>
      ),
    },
    {
      header: 'Gender & DOB',
      render: (p) => (
        <div>
          <span className="text-xs font-medium text-slate-800 block">
            {p.gender} • Born {formatDate(p.dob)}
          </span>
        </div>
      ),
    },
    {
      header: 'Blood Group',
      render: (p) => (
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          {p.bloodGroup}
        </span>
      ),
    },
    {
      header: 'Allergies & Conditions',
      render: (p) => (
        <div className="max-w-xs truncate text-xs">
          {p.allergies && p.allergies.length > 0 ? (
            <span className="text-rose-600 font-semibold block truncate">
              Allergies: {p.allergies.join(', ')}
            </span>
          ) : (
            <span className="text-slate-400 text-2xs block">No allergies</span>
          )}
          {p.chronicConditions && p.chronicConditions.length > 0 && (
            <span className="text-slate-500 text-2xs block truncate">
              Conditions: {p.chronicConditions.join(', ')}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (p) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/patients/${p._id}`);
          }}
          className="px-2.5 py-1 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors inline-flex items-center gap-1"
        >
          <FaFileMedical className="w-3 h-3" /> Medical Chart
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Patient Registry
          </h1>
          <p className="text-xs text-slate-500">
            Clinical profiles, medical records, diagnoses, and personal histories
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition-colors"
        >
          <FaUserPlus className="w-3.5 h-3.5" /> + Register New Patient
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, patient ID, phone, email..."
          className="max-w-md"
        />

        <div className="flex items-center gap-2">
          <FaFilter className="text-slate-400 w-3.5 h-3.5" />
          <select
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
          >
            <option value="">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredPatients}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchPatients(p)}
        onRowClick={(p) => navigate(`/patients/${p._id}`)}
        emptyTitle="No Patients Found"
        emptyDescription="No patient records matched your filter. Register a new patient to get started."
      />

      {/* Register Patient Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Patient"
        subtitle="Create an official hospital medical record profile"
        maxWidth="xl"
      >
        <form onSubmit={handleCreatePatient} className="space-y-4">
          <FormInput
            label="Full Legal Name"
            placeholder="e.g. Eleanor Vance"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Contact Phone"
              placeholder="+1 555-0199"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <FormInput
              label="Email Address"
              type="email"
              placeholder="patient@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Date of Birth"
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              required
            />
            <FormSelect
              label="Gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' },
              ]}
            />
            <FormSelect
              label="Blood Group"
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              options={[
                { label: 'A+', value: 'A+' },
                { label: 'A-', value: 'A-' },
                { label: 'B+', value: 'B+' },
                { label: 'B-', value: 'B-' },
                { label: 'AB+', value: 'AB+' },
                { label: 'AB-', value: 'AB-' },
                { label: 'O+', value: 'O+' },
                { label: 'O-', value: 'O-' },
                { label: 'Unknown', value: 'Unknown' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Allergies (comma separated)"
              placeholder="e.g. Penicillin, Sulfa, Peanuts"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            />
            <FormInput
              label="Chronic Conditions (comma separated)"
              placeholder="e.g. Asthma, Hypertension, Diabetes"
              value={formData.chronicConditions}
              onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Emergency Contact Name"
              placeholder="e.g. Spouse / Sibling"
              value={formData.emergencyName}
              onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
            />
            <FormInput
              label="Emergency Contact Phone"
              placeholder="+1 555-0999"
              value={formData.emergencyPhone}
              onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm"
            >
              Register Patient Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
