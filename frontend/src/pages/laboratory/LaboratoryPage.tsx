import React, { useEffect, useState } from 'react';
import { labApi, patientApi, doctorApi } from '../../services/hospitalApi';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { SearchInput } from '../../components/tables/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/modals/Modal';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { formatDate } from '../../utils/formatters';
import type { LabTest, Patient, Doctor } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { FaFlask, FaPlus, FaCheckCircle, FaTrash, FaVial } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const LaboratoryPage: React.FC = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });

  // Order Lab Test Modal
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [orderForm, setOrderForm] = useState({
    patient: '',
    doctor: '',
    testName: '',
    category: 'Hematology',
    priority: 'Routine',
    sampleType: 'Blood',
    price: 45,
    notes: ''
  });

  // Enter Results Modal
  const [activeTestForResults, setActiveTestForResults] = useState<LabTest | null>(null);
  const [resultRows, setResultRows] = useState([
    { parameter: 'Hemoglobin', value: '14.2', unit: 'g/dL', normalRange: '13.5 - 17.5', status: 'Normal' }
  ]);
  const [technicianNotes, setTechnicianNotes] = useState('');

  useEffect(() => {
    fetchTests(1);
    loadPatientsAndDoctors();
  }, [statusFilter, priorityFilter]);

  const loadPatientsAndDoctors = async () => {
    try {
      const [pRes, dRes] = await Promise.all([
        patientApi.getAll({ limit: 100 }),
        doctorApi.getAll({ limit: 100 })
      ]);
      if (pRes.data.success) setPatients(pRes.data.data);
      if (dRes.data.success) setDoctors(dRes.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTests = async (page: number = 1) => {
    try {
      setLoading(true);
      const params: any = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await labApi.getAll(params);
      if (res.data.success) {
        setTests(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load laboratory test orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.patient || !orderForm.doctor || !orderForm.testName) {
      toast.error('Please complete patient, doctor, and test name fields');
      return;
    }

    try {
      await labApi.create(orderForm);
      toast.success('Laboratory test requested successfully!');
      setIsOrderModalOpen(false);
      setOrderForm({
        patient: '',
        doctor: '',
        testName: '',
        category: 'Hematology',
        priority: 'Routine',
        sampleType: 'Blood',
        price: 45,
        notes: ''
      });
      fetchTests(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to order test');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await labApi.updateStatus(id, status);
      toast.success(`Specimen status updated to ${status}`);
      fetchTests(pagination.page);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const openResultsModal = (test: LabTest) => {
    setActiveTestForResults(test);
    if (test.results && test.results.length > 0) {
      setResultRows(test.results as any);
    } else {
      setResultRows([
        { parameter: 'Parameter 1', value: '', unit: 'mg/dL', normalRange: 'Normal Range', status: 'Normal' }
      ]);
    }
    setTechnicianNotes(test.notes || '');
  };

  const addResultRow = () => {
    setResultRows([
      ...resultRows,
      { parameter: '', value: '', unit: '', normalRange: '', status: 'Normal' }
    ]);
  };

  const removeResultRow = (idx: number) => {
    setResultRows(resultRows.filter((_, i) => i !== idx));
  };

  const updateResultRow = (idx: number, field: string, val: string) => {
    const updated = [...resultRows];
    (updated[idx] as any)[field] = val;
    setResultRows(updated);
  };

  const handleSubmitResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTestForResults) return;

    try {
      await labApi.submitResults(activeTestForResults._id, {
        results: resultRows,
        notes: technicianNotes
      });
      toast.success('Laboratory test results finalized and report published!');
      setActiveTestForResults(null);
      fetchTests(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit results');
    }
  };

  const filtered = tests.filter((t) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      t.testNumber?.toLowerCase().includes(s) ||
      t.testName?.toLowerCase().includes(s) ||
      t.patient?.name?.toLowerCase().includes(s) ||
      t.category?.toLowerCase().includes(s)
    );
  });

  const columns: Column<LabTest>[] = [
    {
      header: 'Test No.',
      accessor: 'testNumber',
      render: (t) => (
        <span className="font-bold text-xs text-primary-700">{t.testNumber}</span>
      ),
    },
    {
      header: 'Patient Details',
      render: (t) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{t.patient?.name}</span>
          <span className="text-2xs text-slate-400">
            {t.patient?.patientId} • {t.patient?.gender}
          </span>
        </div>
      ),
    },
    {
      header: 'Test & Specimen',
      render: (t) => (
        <div>
          <span className="font-semibold text-slate-900 block text-xs">{t.testName}</span>
          <span className="text-2xs text-slate-500">
            {t.category} • Specimen: {t.sampleType}
          </span>
        </div>
      ),
    },
    {
      header: 'Priority',
      render: (t) => (
        <span
          className={`px-2 py-0.5 rounded-full text-2xs font-bold uppercase ${
            t.priority === 'Urgent' || t.priority === 'Stat'
              ? 'bg-rose-100 text-rose-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {t.priority}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (t) => <StatusBadge status={t.status} size="sm" />,
    },
    {
      header: 'Requested',
      render: (t) => <span className="text-xs text-slate-500">{formatDate(t.requestedDate)}</span>,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1.5">
          {t.status === 'Requested' && (user?.role === 'lab_technician' || user?.role === 'admin') && (
            <button
              onClick={() => handleUpdateStatus(t._id, 'Sample-Collected')}
              className="px-2.5 py-1 text-2xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors flex items-center gap-1"
            >
              <FaVial className="w-3 h-3" /> Collect Sample
            </button>
          )}

          {t.status === 'Sample-Collected' && (user?.role === 'lab_technician' || user?.role === 'admin') && (
            <button
              onClick={() => handleUpdateStatus(t._id, 'In-Progress')}
              className="px-2.5 py-1 text-2xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1"
            >
              Analyze
            </button>
          )}

          {(user?.role === 'lab_technician' || user?.role === 'admin') && (
            <button
              onClick={() => openResultsModal(t)}
              className="px-2.5 py-1 text-2xs font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-2xs"
            >
              {t.status === 'Completed' ? 'Review Report' : 'Enter Results'}
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
            Laboratory Diagnostics & Orders
          </h1>
          <p className="text-xs text-slate-500">
            Track biological specimens, enter biochemical test results, and release clinical reports
          </p>
        </div>
        {(user?.role === 'doctor' || user?.role === 'admin' || user?.role === 'lab_technician') && (
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition-colors"
          >
            <FaPlus className="w-3.5 h-3.5" /> + Order Lab Test
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search test number, test name, patient..."
          className="max-w-md"
        />

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="Requested">Requested</option>
            <option value="Sample-Collected">Sample Collected</option>
            <option value="In-Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
          >
            <option value="">All Priorities</option>
            <option value="Routine">Routine</option>
            <option value="Urgent">Urgent</option>
            <option value="Stat">Stat (Critical)</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchTests(p)}
        emptyTitle="No Diagnostic Orders Found"
        emptyDescription="Orders placed by physicians will appear here for sample collection and analysis."
      />

      {/* Order Test Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="Order Diagnostic Laboratory Test"
        subtitle="Request biochemical, hematological, or radiological investigation"
        maxWidth="xl"
      >
        <form onSubmit={handleOrderTest} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Select Patient"
              value={orderForm.patient}
              onChange={(e) => setOrderForm({ ...orderForm, patient: e.target.value })}
              options={[
                { label: '-- Select Patient --', value: '' },
                ...patients.map((p) => ({ label: `${p.name} (${p.patientId})`, value: p._id })),
              ]}
              required
            />
            <FormSelect
              label="Ordering Doctor"
              value={orderForm.doctor}
              onChange={(e) => setOrderForm({ ...orderForm, doctor: e.target.value })}
              options={[
                { label: '-- Select Physician --', value: '' },
                ...doctors.map((d) => ({ label: d.user?.name, value: d._id })),
              ]}
              required
            />
          </div>

          <FormInput
            label="Laboratory Test Name"
            placeholder="e.g. Complete Blood Count (CBC) or Thyroid Panel"
            value={orderForm.testName}
            onChange={(e) => setOrderForm({ ...orderForm, testName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormSelect
              label="Category"
              value={orderForm.category}
              onChange={(e) => setOrderForm({ ...orderForm, category: e.target.value })}
              options={[
                { label: 'Hematology', value: 'Hematology' },
                { label: 'Biochemistry', value: 'Biochemistry' },
                { label: 'Radiology', value: 'Radiology' },
                { label: 'Microbiology', value: 'Microbiology' },
                { label: 'Pathology', value: 'Pathology' },
                { label: 'Immunology', value: 'Immunology' },
              ]}
            />
            <FormSelect
              label="Priority"
              value={orderForm.priority}
              onChange={(e) => setOrderForm({ ...orderForm, priority: e.target.value })}
              options={[
                { label: 'Routine', value: 'Routine' },
                { label: 'Urgent', value: 'Urgent' },
                { label: 'Stat (Critical)', value: 'Stat' },
              ]}
            />
            <FormSelect
              label="Specimen / Sample Type"
              value={orderForm.sampleType}
              onChange={(e) => setOrderForm({ ...orderForm, sampleType: e.target.value })}
              options={[
                { label: 'Blood (Whole)', value: 'Blood' },
                { label: 'Serum', value: 'Serum' },
                { label: 'Urine', value: 'Urine' },
                { label: 'Swab', value: 'Swab' },
                { label: 'Tissue Biopsy', value: 'Tissue' },
                { label: 'Digital Image', value: 'Image' },
              ]}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsOrderModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm"
            >
              Submit Lab Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Enter Test Results Modal */}
      <Modal
        isOpen={!!activeTestForResults}
        onClose={() => setActiveTestForResults(null)}
        title={activeTestForResults?.testName || 'Record Diagnostic Results'}
        subtitle={`Test: ${activeTestForResults?.testNumber} • Patient: ${activeTestForResults?.patient?.name}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitResults} className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Biological Parameters & Reference Ranges
            </span>
            <button
              type="button"
              onClick={addResultRow}
              className="text-2xs font-semibold text-primary-600 hover:text-primary-700"
            >
              + Add Parameter
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto p-1">
            {resultRows.map((row, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold text-slate-500 uppercase">Parameter #{idx + 1}</span>
                  {resultRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeResultRow(idx)}
                      className="text-rose-500 hover:text-rose-700 text-xs"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    placeholder="Parameter (e.g. Total Cholesterol)"
                    value={row.parameter}
                    onChange={(e) => updateResultRow(idx, 'parameter', e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg bg-white col-span-2 sm:col-span-1"
                    required
                  />
                  <input
                    placeholder="Observed Value (e.g. 195)"
                    value={row.value}
                    onChange={(e) => updateResultRow(idx, 'value', e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg bg-white"
                    required
                  />
                  <input
                    placeholder="Unit (e.g. mg/dL)"
                    value={row.unit}
                    onChange={(e) => updateResultRow(idx, 'unit', e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    placeholder="Normal Range (e.g. < 200)"
                    value={row.normalRange}
                    onChange={(e) => updateResultRow(idx, 'normalRange', e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xs font-semibold text-slate-600">Clinical Evaluation:</span>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name={`status-${idx}`}
                      checked={row.status === 'Normal'}
                      onChange={() => updateResultRow(idx, 'status', 'Normal')}
                    />
                    <span className="text-2xs text-emerald-700 font-bold">Normal</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name={`status-${idx}`}
                      checked={row.status === 'Abnormal'}
                      onChange={() => updateResultRow(idx, 'status', 'Abnormal')}
                    />
                    <span className="text-2xs text-amber-700 font-bold">Abnormal</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name={`status-${idx}`}
                      checked={row.status === 'Critical'}
                      onChange={() => updateResultRow(idx, 'status', 'Critical')}
                    />
                    <span className="text-2xs text-rose-700 font-bold">Critical</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Laboratory Pathologist Observations
            </label>
            <textarea
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
              rows={2}
              placeholder="Clinical impressions, specimen notes, or re-test recommendations..."
              value={technicianNotes}
              onChange={(e) => setTechnicianNotes(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTestForResults(null)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm"
            >
              Validate & Publish Report
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
