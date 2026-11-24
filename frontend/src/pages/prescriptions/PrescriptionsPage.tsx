import React, { useEffect, useState } from 'react';
import { prescriptionApi, patientApi, pharmacyApi } from '../../services/hospitalApi';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { SearchInput } from '../../components/tables/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/modals/Modal';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { FormTextarea } from '../../components/forms/FormTextarea';
import { formatDate } from '../../utils/formatters';
import type { Prescription, Patient, Medicine } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import {
  FaFilePrescription,
  FaPrint,
  FaCheckCircle,
  FaPlus,
  FaHospitalAlt,
  FaTrash
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export const PrescriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });

  // Printable View Modal
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);

  // Create Prescription Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [formPatient, setFormPatient] = useState('');
  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formAdvice, setFormAdvice] = useState('');
  const [medItems, setMedItems] = useState([
    { name: '', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After meals' }
  ]);

  useEffect(() => {
    fetchPrescriptions(1);
    loadPatientsAndMedicines();
  }, [statusFilter]);

  const loadPatientsAndMedicines = async () => {
    try {
      const [pRes, mRes] = await Promise.all([
        patientApi.getAll({ limit: 100 }),
        pharmacyApi.getAll({ limit: 100 })
      ]);
      if (pRes.data.success) setPatients(pRes.data.data);
      if (mRes.data.success) setMedicines(mRes.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPrescriptions = async (page: number = 1) => {
    try {
      setLoading(true);
      const params: any = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const res = await prescriptionApi.getAll(params);
      if (res.data.success) {
        setPrescriptions(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async (id: string) => {
    try {
      await prescriptionApi.dispense(id);
      toast.success('Prescription dispensed and stock updated in pharmacy!');
      fetchPrescriptions(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to dispense');
    }
  };

  const addMedRow = () => {
    setMedItems([
      ...medItems,
      { name: '', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After meals' }
    ]);
  };

  const removeMedRow = (idx: number) => {
    setMedItems(medItems.filter((_, i) => i !== idx));
  };

  const updateMedRow = (idx: number, field: string, val: string) => {
    const updated = [...medItems];
    (updated[idx] as any)[field] = val;
    setMedItems(updated);
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPatient || medItems.length === 0 || !medItems[0].name) {
      toast.error('Please pick a patient and include at least one medicine item');
      return;
    }

    try {
      await prescriptionApi.create({
        patient: formPatient,
        diagnosis: formDiagnosis,
        generalAdvice: formAdvice,
        medicines: medItems
      });
      toast.success('Prescription issued successfully!');
      setIsCreateModalOpen(false);
      setFormPatient('');
      setFormDiagnosis('');
      setFormAdvice('');
      setMedItems([
        { name: '', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After meals' }
      ]);
      fetchPrescriptions(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to issue prescription');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filtered = prescriptions.filter((rx) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      rx.prescriptionNumber?.toLowerCase().includes(s) ||
      rx.patient?.name?.toLowerCase().includes(s) ||
      rx.diagnosis?.toLowerCase().includes(s)
    );
  });

  const columns: Column<Prescription>[] = [
    {
      header: 'Rx Number',
      accessor: 'prescriptionNumber',
      render: (rx) => (
        <span className="font-bold text-xs text-primary-700">{rx.prescriptionNumber}</span>
      ),
    },
    {
      header: 'Patient',
      render: (rx) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{rx.patient?.name}</span>
          <span className="text-2xs text-slate-400">{rx.patient?.patientId}</span>
        </div>
      ),
    },
    {
      header: 'Prescribing Physician',
      render: (rx) => (
        <span className="text-xs font-medium text-slate-800">
          Dr. {rx.doctor?.user?.name || 'Physician'}
        </span>
      ),
    },
    {
      header: 'Medications Count',
      render: (rx) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {rx.medicines?.length || 0} Drugs
        </span>
      ),
    },
    {
      header: 'Status',
      render: (rx) => <StatusBadge status={rx.status} size="sm" />,
    },
    {
      header: 'Issue Date',
      render: (rx) => <span className="text-xs text-slate-500">{formatDate(rx.createdAt)}</span>,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (rx) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setActivePrescription(rx)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1"
          >
            <FaPrint className="w-3 h-3 text-slate-500" /> View / Print
          </button>
          {(user?.role === 'pharmacist' || user?.role === 'admin') && rx.status === 'Issued' && (
            <button
              onClick={() => handleDispense(rx._id)}
              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
            >
              <FaCheckCircle className="w-3 h-3" /> Dispense
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Prescriptions & Medication Orders
          </h1>
          <p className="text-xs text-slate-500">
            Formulary drug orders, dosage regimens, instructions, and dispensary status
          </p>
        </div>
        {(user?.role === 'doctor' || user?.role === 'admin') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition-colors"
          >
            <FaPlus className="w-3.5 h-3.5" /> + Issue Prescription
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by Rx number, patient, or diagnosis..."
          className="max-w-md"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="Issued">Issued (Pending Dispense)</option>
          <option value="Dispensed">Dispensed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchPrescriptions(p)}
        emptyTitle="No Prescriptions Found"
        emptyDescription="Clinical prescriptions will be archived here once authorized by medical staff."
      />

      {/* Printable Prescription Modal */}
      <Modal
        isOpen={!!activePrescription}
        onClose={() => setActivePrescription(null)}
        title="Official Medical Prescription Sheet"
        maxWidth="2xl"
      >
        {activePrescription && (
          <div className="space-y-6 printable-card text-xs">
            {/* Hospital Letterhead */}
            <div className="border-b-2 border-primary-600 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
                  <FaHospitalAlt className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                    AuraCare General Hospital
                  </h2>
                  <p className="text-2xs text-slate-500">
                    Department of Clinical Medicine • Central Healthcare Network
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-primary-700 block text-sm">
                  {activePrescription.prescriptionNumber}
                </span>
                <span className="text-2xs text-slate-500">
                  Date: {formatDate(activePrescription.createdAt)}
                </span>
              </div>
            </div>

            {/* Patient & Doctor Banner */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-2xs text-slate-400 uppercase font-bold block">Patient</span>
                <span className="font-bold text-sm text-slate-900 block">
                  {activePrescription.patient?.name}
                </span>
                <span className="text-2xs text-slate-600">
                  ID: {activePrescription.patient?.patientId} • Blood: {activePrescription.patient?.bloodGroup}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xs text-slate-400 uppercase font-bold block">Attending Physician</span>
                <span className="font-bold text-sm text-slate-900 block">
                  Dr. {activePrescription.doctor?.user?.name || 'Physician'}
                </span>
                <span className="text-2xs text-slate-600">Registered Medical Practitioner</span>
              </div>
            </div>

            {activePrescription.diagnosis && (
              <div className="text-xs">
                <span className="font-bold text-slate-900">Diagnosis: </span>
                <span className="text-slate-700">{activePrescription.diagnosis}</span>
              </div>
            )}

            {/* Medicines List */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2">
                Prescribed Medications (Rx)
              </h4>
              <table className="w-full text-left border-collapse border border-slate-200">
                <thead className="bg-slate-100 text-2xs uppercase text-slate-600">
                  <tr>
                    <th className="p-2.5 border border-slate-200">Drug / Formulation</th>
                    <th className="p-2.5 border border-slate-200">Dosage</th>
                    <th className="p-2.5 border border-slate-200">Frequency</th>
                    <th className="p-2.5 border border-slate-200">Duration</th>
                    <th className="p-2.5 border border-slate-200">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activePrescription.medicines?.map((m: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-2.5 border border-slate-200 font-bold text-slate-900">{m.name}</td>
                      <td className="p-2.5 border border-slate-200">{m.dosage}</td>
                      <td className="p-2.5 border border-slate-200">{m.frequency}</td>
                      <td className="p-2.5 border border-slate-200">{m.duration}</td>
                      <td className="p-2.5 border border-slate-200 text-slate-600">{m.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {activePrescription.generalAdvice && (
              <div className="p-3 bg-slate-50 border rounded-lg text-slate-700 text-xs">
                <strong className="text-slate-900 block mb-0.5">Physician Advice & Lifestyle Notes:</strong>
                {activePrescription.generalAdvice}
              </div>
            )}

            {/* Signature & Print Footer */}
            <div className="pt-6 flex items-center justify-between no-print">
              <span className="text-2xs text-slate-400">
                Status: <StatusBadge status={activePrescription.status} size="sm" />
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <FaPrint className="w-3.5 h-3.5" /> Print Prescription
                </button>
                <button
                  type="button"
                  onClick={() => setActivePrescription(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Issue Prescription Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Issue New Medical Prescription"
        subtitle="Formulate and authorize pharmaceutical treatment for patient"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreatePrescription} className="space-y-4">
          <FormSelect
            label="Select Patient"
            value={formPatient}
            onChange={(e) => setFormPatient(e.target.value)}
            options={[
              { label: '-- Select Patient Record --', value: '' },
              ...patients.map((p) => ({ label: `${p.name} (${p.patientId})`, value: p._id })),
            ]}
            required
          />

          <FormInput
            label="Clinical Diagnosis"
            placeholder="e.g. Hypertension & High Cholesterol"
            value={formDiagnosis}
            onChange={(e) => setFormDiagnosis(e.target.value)}
            required
          />

          {/* Medicines Dynamic Rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Prescription Items
              </span>
              <button
                type="button"
                onClick={addMedRow}
                className="text-2xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                + Add Another Medicine
              </button>
            </div>

            {medItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold text-slate-500 uppercase">Drug #{idx + 1}</span>
                  {medItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedRow(idx)}
                      className="text-rose-500 hover:text-rose-700 text-xs"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-2xs text-slate-500 block mb-0.5">Medicine Name</label>
                    <input
                      list="med-list"
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                      placeholder="e.g. Amoxicillin or Atorvastatin"
                      value={item.name}
                      onChange={(e) => updateMedRow(idx, 'name', e.target.value)}
                      required
                    />
                    <datalist id="med-list">
                      {medicines.map((m) => (
                        <option key={m._id} value={m.name} />
                      ))}
                    </datalist>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-2xs text-slate-500 block mb-0.5">Dosage</label>
                      <input
                        className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                        placeholder="e.g. 500mg"
                        value={item.dosage}
                        onChange={(e) => updateMedRow(idx, 'dosage', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-2xs text-slate-500 block mb-0.5">Duration</label>
                      <input
                        className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                        placeholder="e.g. 7 days"
                        value={item.duration}
                        onChange={(e) => updateMedRow(idx, 'duration', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-2xs text-slate-500 block mb-0.5">Frequency</label>
                    <input
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                      placeholder="e.g. Twice daily (1-0-1)"
                      value={item.frequency}
                      onChange={(e) => updateMedRow(idx, 'frequency', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-2xs text-slate-500 block mb-0.5">Special Instructions</label>
                    <input
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                      placeholder="e.g. Take after meals with full glass of water"
                      value={item.instructions}
                      onChange={(e) => updateMedRow(idx, 'instructions', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <FormTextarea
            label="General Physician Advice"
            placeholder="Dietary changes, physical activity guidance, warning signs..."
            value={formAdvice}
            onChange={(e) => setFormAdvice(e.target.value)}
            rows={2}
          />

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm"
            >
              Authorize & Issue Prescription
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
