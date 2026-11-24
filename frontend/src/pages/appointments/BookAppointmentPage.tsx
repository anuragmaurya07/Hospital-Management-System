import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentApi, doctorApi, appointmentApi } from '../../services/hospitalApi';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { FormTextarea } from '../../components/forms/FormTextarea';
import type { Department, Doctor } from '../../types';
import { FaCalendarAlt, FaUserMd, FaHospital, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const BookAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<{ timeSlot: string; isBooked: boolean }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    department: '',
    doctor: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '',
    type: 'General',
    reason: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [deptRes, docRes] = await Promise.all([
        departmentApi.getAll(),
        doctorApi.getAll({ limit: 100 })
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (docRes.data.success) setDoctors(docRes.data.data);
    } catch (e) {
      toast.error('Failed to load doctors and departments');
    }
  };

  useEffect(() => {
    if (form.doctor && form.appointmentDate) {
      loadSlots(form.doctor, form.appointmentDate);
    }
  }, [form.doctor, form.appointmentDate]);

  const loadSlots = async (doctorId: string, date: string) => {
    try {
      setSlotsLoading(true);
      const res = await doctorApi.getAvailability(doctorId, date);
      if (res.data.success) {
        setAvailableSlots(res.data.data.slots || []);
      }
    } catch (e) {
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.doctor || !form.appointmentDate || !form.timeSlot || !form.reason) {
      toast.error('Please pick a doctor, date, available time slot, and specify visit reason');
      return;
    }

    setSubmitting(true);
    try {
      await appointmentApi.create(form);
      toast.success('Your consultation appointment has been scheduled!');
      navigate('/appointments');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d._id === form.doctor);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Book Doctor Consultation
        </h1>
        <p className="text-xs text-slate-500">
          Select clinical specialty, physician, and preferred time slot for your appointment
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Specialty & Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Medical Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value, doctor: '', timeSlot: '' })}
              options={[
                { label: '-- All Specialties --', value: '' },
                ...departments.map((d) => ({ label: d.name, value: d._id })),
              ]}
            />

            <FormSelect
              label="Consulting Doctor"
              value={form.doctor}
              onChange={(e) => {
                const doc = doctors.find((d) => d._id === e.target.value);
                setForm({
                  ...form,
                  doctor: e.target.value,
                  department: doc ? doc.department?._id : form.department,
                  timeSlot: ''
                });
              }}
              options={[
                { label: '-- Choose Doctor --', value: '' },
                ...doctors
                  .filter((d) => !form.department || d.department?._id === form.department)
                  .map((d) => ({
                    label: `${d.user?.name} (${d.specialization} • $${d.consultationFee})`,
                    value: d._id,
                  })),
              ]}
              required
            />
          </div>

          {selectedDoctor && (
            <div className="p-4 bg-primary-50/60 border border-primary-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">{selectedDoctor.user?.name}</span>
                <span className="text-slate-600 block">{selectedDoctor.specialization} • {selectedDoctor.qualification}</span>
                <span className="text-2xs text-primary-700 font-medium">Room: {selectedDoctor.roomNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-primary-700">${selectedDoctor.consultationFee}</span>
                <span className="text-2xs text-slate-500 block">consultation fee</span>
              </div>
            </div>
          )}

          {/* Step 2: Date & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Appointment Date"
              type="date"
              value={form.appointmentDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm({ ...form, appointmentDate: e.target.value, timeSlot: '' })}
              required
            />

            <FormSelect
              label="Type of Consultation"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={[
                { label: 'General Consultation', value: 'General' },
                { label: 'Follow-up Visit', value: 'Follow-up' },
                { label: 'Routine Health Checkup', value: 'Routine Checkup' },
                { label: 'Urgent Attention', value: 'Emergency' },
              ]}
            />
          </div>

          {/* Step 3: Available Slots */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Time Slot {form.timeSlot && `(Selected: ${form.timeSlot})`} *
            </label>
            {slotsLoading ? (
              <div className="py-4 text-center text-xs text-slate-500">
                Checking availability schedule...
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1 border rounded-xl border-slate-200">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.timeSlot}
                    type="button"
                    disabled={slot.isBooked}
                    onClick={() => setForm({ ...form, timeSlot: slot.timeSlot })}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                      slot.isBooked
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                        : form.timeSlot === slot.timeSlot
                        ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-primary-400 hover:bg-primary-50/50'
                    }`}
                  >
                    {slot.timeSlot}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                {form.doctor
                  ? 'Doctor is not available on this day or all slots are booked. Please pick another date.'
                  : 'Please pick a doctor and appointment date to load open slots.'}
              </p>
            )}
          </div>

          {/* Step 4: Reason */}
          <FormTextarea
            label="Symptoms or Reason for Consultation"
            placeholder="Describe your symptoms or reason for visit in detail..."
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={3}
            required
          />

          <button
            type="submit"
            disabled={submitting || !form.timeSlot}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
          >
            {submitting ? 'Confirming with Hospital System...' : 'Schedule & Confirm Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};
