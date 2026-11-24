import React, { useEffect, useState } from 'react';
import { departmentApi, doctorApi } from '../../services/hospitalApi';
import { Modal } from '../../components/modals/Modal';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { FormTextarea } from '../../components/forms/FormTextarea';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { Department, Doctor } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { FaHospital, FaUserMd, FaMapMarkerAlt, FaPlus, FaPhone } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const DepartmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Department Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headOfDepartment: '',
    location: 'Building A, Floor 1',
    contactNumber: '+1 555-0100'
  });

  useEffect(() => {
    fetchDepartments();
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await doctorApi.getAll({ limit: 100 });
      if (res.data.success) setDoctors(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentApi.getAll();
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast.error('Department name and code are required');
      return;
    }

    try {
      await departmentApi.create(formData);
      toast.success('Department created successfully!');
      setIsModalOpen(false);
      setFormData({
        name: '',
        code: '',
        description: '',
        headOfDepartment: '',
        location: 'Building A, Floor 1',
        contactNumber: '+1 555-0100'
      });
      fetchDepartments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create department');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading Hospital Clinical Departments..." />;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Hospital Departments
          </h1>
          <p className="text-xs text-slate-500">
            Clinical specialties, facility locations, department leadership, and staffing
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition-colors"
          >
            <FaPlus className="w-3.5 h-3.5" /> + New Department
          </button>
        )}
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => (
          <div
            key={dept._id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                  <FaHospital className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                  {dept.code}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{dept.name}</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                {dept.description || 'Comprehensive clinical diagnosis, patient therapy, and specialized healthcare.'}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <FaUserMd className="w-3.5 h-3.5" /> Department Doctors:
                </span>
                <span className="font-bold text-slate-900">{dept.doctorCount || 0} Physicians</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <FaMapMarkerAlt className="w-3.5 h-3.5" /> Location:
                </span>
                <span className="font-medium text-slate-800 truncate max-w-[160px] text-right">
                  {dept.location || 'Main Hospital Wing'}
                </span>
              </div>

              {dept.headOfDepartment && (
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Head of Dept:</span>
                  <span className="font-semibold text-primary-700">
                    {dept.headOfDepartment?.user?.name || 'Assigned'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Clinical Department"
        subtitle="Establish a new hospital department or medical wing"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateDepartment} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Department Name"
              placeholder="e.g. Oncology"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <FormInput
              label="Department Code"
              placeholder="e.g. ONCO"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
            />
          </div>

          <FormTextarea
            label="Department Description"
            placeholder="Specialized medical scope, treatments, and facilities..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Facility Location"
              placeholder="e.g. Building B, Floor 2"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <FormInput
              label="Contact Phone"
              placeholder="+1 555-0150"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
            />
          </div>

          <FormSelect
            label="Head of Department"
            value={formData.headOfDepartment}
            onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
            options={[
              { label: '-- Select Senior Doctor (Optional) --', value: '' },
              ...doctors.map((d) => ({
                label: `${d.user?.name} (${d.specialization})`,
                value: d._id
              }))
            ]}
          />

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm"
            >
              Create Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
