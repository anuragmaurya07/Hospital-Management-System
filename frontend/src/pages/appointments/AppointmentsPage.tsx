import React, { useEffect, useState } from 'react';
import { appointmentApi, doctorApi, departmentApi, patientApi } from '../../services/hospitalApi';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { SearchInput } from '../../components/tables/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/modals/Modal';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { FormTextarea } from '../../components/forms/FormTextarea';
import { formatDate } from '../../utils/formatters';
import type { Appointment, Doctor, Department, Patient } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { FaCalendarPlus, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableSlots, setAvailableSlots] = useState<{ timeSlot: string; isBooked: boolean }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [bookForm, setBookForm] = useState({
    patient: '',
    doctor: '',
    department: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '',
    type: 'General',
    reason: ''
  });

  useEffect(() => {
    fetchAppointments(1);
    loadFormData();
  }, [statusFilter]);

  const loadFormData = async () => {
    try {
      const [pRes, dRes, deptRes] = await Promise.all([
        patientApi.getAll({ limit: 100 }),
        doctorApi.getAll({ limit: 100 }),
        departmentApi.getAll()
      ]);
      if (pRes.data.success) setPatients(pRes.data.data);
      if (dRes.data.success) setDoctors(dRes.data.data);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async (page: number = 1) => {
    try {
      setLoading(true);
      const params: any = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const res = await appointmentApi.getAll(params);
      if (res.data.success) {
        setAppointments(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // When doctor or appointment date changes, fetch available time slots
  useEffect(() => {
    if (bookForm.doctor && bookForm.appointmentDate) {
      fetchSlots(bookForm.doctor, bookForm.appointmentDate);
    }
  }, [bookForm.doctor, bookForm.appointmentDate]);

  const fetchSlots = async (doctorId: string, date: string) => {
    try {
      setSlotsLoading(true);
      const res = await doctorApi.getAvailability(doctorId, date);
      if (res.data.success) {
        setAvailableSlots(res.data.data.slots || []);
      }
    } catch (err) {
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.doctor || !bookForm.appointmentDate || !bookForm.timeSlot || !bookForm.reason) {
      toast.error('Please fill in all required fields and pick a time slot');
      return;
    }

    try {
      await appointmentApi.create(bookForm);
      toast.success('Appointment booked successfully!');
      setIsBookModalOpen(false);
      setBookForm({
        patient: '',
        doctor: '',
        department: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        timeSlot: '',
        type: 'General',
        reason: ''
      });
      fetchAppointments(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await appointmentApi.updateStatus(id, status);
      toast.success(`Status updated to ${status}`);
      fetchAppointments(pagination.page);
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      apt.appointmentNumber?.toLowerCase().includes(s) ||
      apt.patient?.name?.toLowerCase().includes(s) ||
      apt.doctor?.user?.name?.toLowerCase().includes(s) ||
      apt.reason?.toLowerCase().includes(s)
    );
  });

  const columns: Column<Appointment>[] = [
    {
      header: 'Appt No.',
      accessor: 'appointmentNumber',
      render: (apt) => (
        <span className="font-bold text-xs text-primary-700">
          {apt.appointmentNumber}
        </span>
      ),
    },
    {
      header: 'Patient',
      render: (apt) => (
        <div>
          <span className="font-semibold text-slate-900 block text-xs">
            {apt.patient?.name}
          </span>
          <span className="text-2xs text-slate-400">
            {apt.patient?.patientId} • {apt.patient?.phone}
          </span>
        </div>
      ),
    },
    {
      header: 'Doctor & Dept',
      render: (apt) => (
        <div>
          <span className="font-medium text-slate-900 block text-xs">
            {apt.doctor?.user?.name || 'Dr. Specialist'}
          </span>
          <span className="text-2xs text-slate-500">
            {apt.department?.name}
          </span>
        </div>
      ),
    },
    {
      header: 'Date & Slot',
      render: (apt) => (
        <div>
          <span className="font-medium text-slate-900 block text-xs">
            {formatDate(apt.appointmentDate)}
          </span>
          <span className="text-2xs text-primary-600 font-semibold">
            {apt.timeSlot} ({apt.type})
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (apt) => <StatusBadge status={apt.status} size="sm" />,
    },
    {
      header: 'Fee & Payment',
      render: (apt) => (
        <div>
          <span className="text-xs font-bold text-slate-900">${apt.fee}</span>
          <span className="block text-2xs">
            <StatusBadge status={apt.paymentStatus} size="sm" />
          </span>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (apt) => (
        <div className="flex items-center justify-end gap-1.5">
          {apt.status === 'Confirmed' && (
            <button
              onClick={() => handleStatusChange(apt._id, 'In-Consultation')}
              className="px-2 py-1 text-2xs font-semibold bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              Start
            </button>
          )}
          {apt.status === 'In-Consultation' && (
            <button
              onClick={() => handleStatusChange(apt._id, 'Completed')}
              className="px-2 py-1 text-2xs font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
            >
              Finish
            </button>
          )}
          {['Pending', 'Confirmed'].includes(apt.status) && (
            <button
              onClick={() => handleStatusChange(apt._id, 'Cancelled')}
              className="px-2 py-1 text-2xs font-medium text-rose-600 hover:bg-rose-50 rounded transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Appointments Directory
          </h1>
          <p className="text-xs text-slate-500">
            Schedule, monitor, and manage clinical visits across all hospital departments
          </p>
        </div>
        <button
          onClick={() => setIsBookModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition-colors"
        >
          <FaCalendarPlus className="w-3.5 h-3.5" /> Book Appointment
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by appointment no, patient, doctor, reason..."
          className="max-w-md"
        />

        <div className="flex items-center gap-2">
          <FaFilter className="text-slate-400 w-3.5 h-3.5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-hidden focus:border-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In-Consultation">In-Consultation</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Data Table */}
      <DataTable
        columns={columns}
        data={filteredAppointments}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchAppointments(p)}
        emptyTitle="No Appointments Scheduled"
        emptyDescription="No appointments matched your query. Click 'Book Appointment' to schedule a patient visit."
      />

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule Clinical Appointment"
        subtitle="Book a consultation slot with patient and doctor verification"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          {user?.role !== 'patient' && (
            <FormSelect
              label="Select Patient"
              value={bookForm.patient}
              onChange={(e) => setBookForm({ ...bookForm, patient: e.target.value })}
              options={[
                { label: '-- Choose Patient --', value: '' },
                ...patients.map((p) => ({
                  label: `${p.name} (${p.patientId} - ${p.phone})`,
                  value: p._id,
                })),
              ]}
              required
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Department"
              value={bookForm.department}
              onChange={(e) => {
                setBookForm({ ...bookForm, department: e.target.value, doctor: '', timeSlot: '' });
              }}
              options={[
                { label: '-- All Departments --', value: '' },
                ...departments.map((d) => ({ label: d.name, value: d._id })),
              ]}
            />

            <FormSelect
              label="Doctor"
              value={bookForm.doctor}
              onChange={(e) => {
                const doc = doctors.find((d) => d._id === e.target.value);
                setBookForm({
                  ...bookForm,
                  doctor: e.target.value,
                  department: doc ? doc.department?._id : bookForm.department,
                  timeSlot: ''
                });
              }}
              options={[
                { label: '-- Select Doctor --', value: '' },
                ...doctors
                  .filter((d) => !bookForm.department || d.department?._id === bookForm.department)
                  .map((d) => ({
                    label: `${d.user?.name} (${d.specialization} - $${d.consultationFee})`,
                    value: d._id,
                  })),
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Appointment Date"
              type="date"
              value={bookForm.appointmentDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setBookForm({ ...bookForm, appointmentDate: e.target.value, timeSlot: '' })}
              required
            />

            <FormSelect
              label="Visit Type"
              value={bookForm.type}
              onChange={(e) => setBookForm({ ...bookForm, type: e.target.value })}
              options={[
                { label: 'General Consultation', value: 'General' },
                { label: 'Follow-up Visit', value: 'Follow-up' },
                { label: 'Routine Checkup', value: 'Routine Checkup' },
                { label: 'Emergency', value: 'Emergency' },
              ]}
            />
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Available Time Slots {bookForm.timeSlot && `(Selected: ${bookForm.timeSlot})`} *
            </label>
            {slotsLoading ? (
              <div className="py-4 text-center text-xs text-slate-500">
                Checking doctor availability schedule...
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 border rounded-lg border-slate-200">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.timeSlot}
                    type="button"
                    disabled={slot.isBooked}
                    onClick={() => setBookForm({ ...bookForm, timeSlot: slot.timeSlot })}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all text-center ${
                      slot.isBooked
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                        : bookForm.timeSlot === slot.timeSlot
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-primary-400 hover:bg-primary-50/50'
                    }`}
                  >
                    {slot.timeSlot}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                {bookForm.doctor
                  ? 'Doctor is not available on this day or no slots open. Please select another date.'
                  : 'Please select a doctor and date first to view open consultation slots.'}
              </p>
            )}
          </div>

          <FormTextarea
            label="Chief Complaint / Reason for Visit"
            placeholder="e.g. Chest pain with mild shortness of breath for past 2 days..."
            value={bookForm.reason}
            onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })}
            required
            rows={2}
          />

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!bookForm.timeSlot}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
            >
              Confirm Appointment Booking
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
