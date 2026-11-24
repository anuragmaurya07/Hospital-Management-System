import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { patientApi, medicalRecordApi } from '../../services/hospitalApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/modals/Modal';
import { FormInput } from '../../components/forms/FormInput';
import { FormTextarea } from '../../components/forms/FormTextarea';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  FaUserInjured,
  FaNotesMedical,
  FaPrescriptionBottleAlt,
  FaFlask,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaArrowLeft,
  FaPlus
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'records' | 'prescriptions' | 'lab' | 'appointments' | 'billing'>('records');

  // Record creation modal state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({
    diagnosis: '',
    symptoms: '',
    clinicalNotes: '',
    treatmentPlan: '',
    bloodPressure: '120/80',
    heartRate: 72,
    temperature: 98.6,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    weightKg: 70
  });

  useEffect(() => {
    if (id) fetchHistory();
  }, [id]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await patientApi.getHistory(id!);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load patient clinical history');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await medicalRecordApi.create({
        patient: id,
        diagnosis: recordForm.diagnosis,
        symptoms: recordForm.symptoms ? recordForm.symptoms.split(',').map((s) => s.trim()) : [],
        clinicalNotes: recordForm.clinicalNotes,
        treatmentPlan: recordForm.treatmentPlan,
        vitals: {
          bloodPressure: recordForm.bloodPressure,
          heartRate: Number(recordForm.heartRate),
          temperature: Number(recordForm.temperature),
          respiratoryRate: Number(recordForm.respiratoryRate),
          oxygenSaturation: Number(recordForm.oxygenSaturation),
          weightKg: Number(recordForm.weightKg)
        }
      });
      toast.success('Clinical examination record added!');
      setIsRecordModalOpen(false);
      fetchHistory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save medical record');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" label="Loading Comprehensive Medical Chart..." />;
  }

  const patient = data?.patient || {};
  const records = data?.medicalRecords || [];
  const prescriptions = data?.prescriptions || [];
  const labTests = data?.labTests || [];
  const appointments = data?.appointments || [];
  const bills = data?.bills || [];

  return (
    <div className="space-y-6">
      {/* Back button & Action Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/patients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <FaArrowLeft className="w-3 h-3" /> Back to Patient Directory
        </Link>
        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors"
        >
          <FaPlus className="w-3 h-3" /> Add Clinical Record
        </button>
      </div>

      {/* Patient Demographic Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 font-extrabold text-2xl flex items-center justify-center">
              {patient.name?.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
                  {patient.patientId}
                </span>
              </div>
              <span className="text-xs text-slate-500 block mt-0.5">
                {patient.gender} • Born {formatDate(patient.dob)} • Blood Group: {patient.bloodGroup}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-600">
            <div>
              <span className="text-2xs text-slate-400 block uppercase font-bold">Contact</span>
              <span className="font-semibold text-slate-900">{patient.phone}</span>
            </div>
            <div>
              <span className="text-2xs text-slate-400 block uppercase font-bold">Emergency</span>
              <span className="font-semibold text-slate-900">
                {patient.emergencyContact?.name || 'N/A'} ({patient.emergencyContact?.phone || 'N/A'})
              </span>
            </div>
            <div>
              <span className="text-2xs text-slate-400 block uppercase font-bold">Allergies</span>
              <span className="font-semibold text-rose-600">
                {patient.allergies?.length > 0 ? patient.allergies.join(', ') : 'None registered'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-4 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('records')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'records'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FaNotesMedical className="w-3.5 h-3.5" /> Medical Records ({records.length})
        </button>
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'prescriptions'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FaPrescriptionBottleAlt className="w-3.5 h-3.5" /> Prescriptions ({prescriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('lab')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'lab'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FaFlask className="w-3.5 h-3.5" /> Lab Results ({labTests.length})
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'appointments'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FaCalendarAlt className="w-3.5 h-3.5" /> Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'billing'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FaFileInvoiceDollar className="w-3.5 h-3.5" /> Invoices ({bills.length})
        </button>
      </div>

      {/* Tab 1: Medical Records */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {records.length > 0 ? (
            records.map((rec: any) => (
              <div key={rec._id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-xs font-bold text-primary-700">{rec.recordNumber}</span>
                    <h3 className="text-base font-bold text-slate-900">{rec.diagnosis}</h3>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(rec.visitDate)}</span>
                </div>

                {/* Vitals Grid */}
                {rec.vitals && (
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-slate-50 p-3 rounded-lg text-xs mb-3">
                    <div>
                      <span className="text-2xs text-slate-400 block">BP</span>
                      <span className="font-bold text-slate-800">{rec.vitals.bloodPressure || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-2xs text-slate-400 block">Pulse</span>
                      <span className="font-bold text-slate-800">{rec.vitals.heartRate ? `${rec.vitals.heartRate} bpm` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-2xs text-slate-400 block">Temp</span>
                      <span className="font-bold text-slate-800">{rec.vitals.temperature ? `${rec.vitals.temperature} °F` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-2xs text-slate-400 block">SpO2</span>
                      <span className="font-bold text-slate-800">{rec.vitals.oxygenSaturation ? `${rec.vitals.oxygenSaturation}%` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-2xs text-slate-400 block">Weight</span>
                      <span className="font-bold text-slate-800">{rec.vitals.weightKg ? `${rec.vitals.weightKg} kg` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-2xs text-slate-400 block">Doctor</span>
                      <span className="font-bold text-slate-800 truncate block">{rec.doctor?.user?.name || 'Doctor'}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-xs text-slate-700">
                  {rec.clinicalNotes && (
                    <p><strong className="text-slate-900">Clinical Notes:</strong> {rec.clinicalNotes}</p>
                  )}
                  {rec.treatmentPlan && (
                    <p><strong className="text-slate-900">Treatment Plan:</strong> {rec.treatmentPlan}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center bg-white rounded-xl border border-slate-200">
              No clinical examination records on file. Click 'Add Clinical Record' above.
            </p>
          )}
        </div>
      )}

      {/* Tab 2: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions.length > 0 ? (
            prescriptions.map((rx: any) => (
              <div key={rx._id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-xs font-bold text-primary-700">{rx.prescriptionNumber}</span>
                    <span className="text-xs text-slate-500 block">Doctor: {rx.doctor?.user?.name}</span>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={rx.status} size="sm" />
                    <span className="text-2xs text-slate-400 block mt-0.5">{formatDate(rx.createdAt)}</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {rx.medicines?.map((med: any, idx: number) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{med.name}</span>
                        <span className="text-2xs text-slate-500 block">Instructions: {med.instructions}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-700 block">{med.dosage}</span>
                        <span className="text-2xs text-slate-400">{med.frequency} for {med.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center bg-white rounded-xl border border-slate-200">
              No medications prescribed yet.
            </p>
          )}
        </div>
      )}

      {/* Tab 3: Lab Tests */}
      {activeTab === 'lab' && (
        <div className="space-y-4">
          {labTests.length > 0 ? (
            labTests.map((t: any) => (
              <div key={t._id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-xs font-bold text-primary-700">{t.testNumber}</span>
                    <h3 className="text-sm font-bold text-slate-900">{t.testName} ({t.category})</h3>
                  </div>
                  <StatusBadge status={t.status} size="sm" />
                </div>

                {t.results?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg text-xs">
                    {t.results.map((r: any, idx: number) => (
                      <div key={idx}>
                        <span className="text-2xs text-slate-400 block">{r.parameter}</span>
                        <span className={`font-bold ${r.status === 'Abnormal' ? 'text-rose-600' : 'text-slate-800'}`}>
                          {r.value} {r.unit}
                        </span>
                        <span className="text-2xs text-slate-400 block">Ref: {r.normalRange}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Results pending analysis.</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center bg-white rounded-xl border border-slate-200">
              No diagnostic tests ordered.
            </p>
          )}
        </div>
      )}

      {/* Tab 4: Appointments */}
      {activeTab === 'appointments' && (
        <div className="space-y-3">
          {appointments.length > 0 ? (
            appointments.map((a: any) => (
              <div key={a._id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{formatDate(a.appointmentDate)} at {a.timeSlot}</span>
                  <span className="text-slate-500">Dr. {a.doctor?.user?.name} ({a.department?.name}) • {a.reason}</span>
                </div>
                <StatusBadge status={a.status} size="sm" />
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center bg-white rounded-xl border border-slate-200">
              No appointments on record.
            </p>
          )}
        </div>
      )}

      {/* Tab 5: Invoices */}
      {activeTab === 'billing' && (
        <div className="space-y-3">
          {bills.length > 0 ? (
            bills.map((b: any) => (
              <div key={b._id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{b.invoiceNumber}</span>
                  <span className="text-slate-500">Total: {formatCurrency(b.totalAmount)} • Balance Due: {formatCurrency(b.balanceAmount)}</span>
                </div>
                <StatusBadge status={b.paymentStatus} size="sm" />
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center bg-white rounded-xl border border-slate-200">
              No billing records on file.
            </p>
          )}
        </div>
      )}

      {/* Add Clinical Record Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Add Clinical Examination Record"
        subtitle={`Recording medical findings for ${patient.name}`}
        maxWidth="xl"
      >
        <form onSubmit={handleCreateRecord} className="space-y-4">
          <FormInput
            label="Diagnosis"
            placeholder="e.g. Acute Bronchitis"
            value={recordForm.diagnosis}
            onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
            required
          />

          <FormInput
            label="Symptoms (comma separated)"
            placeholder="e.g. Persistent cough, mild fever, chest tightness"
            value={recordForm.symptoms}
            onChange={(e) => setRecordForm({ ...recordForm, symptoms: e.target.value })}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <FormInput
              label="Blood Pressure"
              placeholder="120/80"
              value={recordForm.bloodPressure}
              onChange={(e) => setRecordForm({ ...recordForm, bloodPressure: e.target.value })}
            />
            <FormInput
              label="Heart Rate (bpm)"
              type="number"
              value={recordForm.heartRate}
              onChange={(e) => setRecordForm({ ...recordForm, heartRate: Number(e.target.value) })}
            />
            <FormInput
              label="Temperature (°F)"
              type="number"
              step="0.1"
              value={recordForm.temperature}
              onChange={(e) => setRecordForm({ ...recordForm, temperature: Number(e.target.value) })}
            />
            <FormInput
              label="SpO2 (%)"
              type="number"
              value={recordForm.oxygenSaturation}
              onChange={(e) => setRecordForm({ ...recordForm, oxygenSaturation: Number(e.target.value) })}
            />
            <FormInput
              label="Weight (kg)"
              type="number"
              value={recordForm.weightKg}
              onChange={(e) => setRecordForm({ ...recordForm, weightKg: Number(e.target.value) })}
            />
          </div>

          <FormTextarea
            label="Clinical Findings & Notes"
            placeholder="Observations on chest auscultation, physical examination..."
            value={recordForm.clinicalNotes}
            onChange={(e) => setRecordForm({ ...recordForm, clinicalNotes: e.target.value })}
            rows={3}
          />

          <FormTextarea
            label="Treatment Plan & Recommendations"
            placeholder="Recommended therapy, follow-up advice..."
            value={recordForm.treatmentPlan}
            onChange={(e) => setRecordForm({ ...recordForm, treatmentPlan: e.target.value })}
            rows={2}
          />

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm"
            >
              Save Clinical Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
