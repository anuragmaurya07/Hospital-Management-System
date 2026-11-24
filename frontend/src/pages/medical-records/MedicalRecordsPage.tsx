import React, { useEffect, useState } from 'react';
import { medicalRecordApi } from '../../services/hospitalApi';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { SearchInput } from '../../components/tables/SearchInput';
import { Modal } from '../../components/modals/Modal';
import { formatDate } from '../../utils/formatters';
import type { MedicalRecord } from '../../types';
import { FaNotesMedical, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const MedicalRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    fetchRecords(1);
  }, []);

  const fetchRecords = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await medicalRecordApi.getAll({ page, limit: 15 });
      if (res.data.success) {
        setRecords(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load clinical records');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.recordNumber?.toLowerCase().includes(s) ||
      r.patient?.name?.toLowerCase().includes(s) ||
      r.diagnosis?.toLowerCase().includes(s) ||
      r.doctor?.user?.name?.toLowerCase().includes(s)
    );
  });

  const columns: Column<MedicalRecord>[] = [
    {
      header: 'Record No.',
      accessor: 'recordNumber',
      render: (r) => (
        <span className="font-bold text-xs text-primary-700">{r.recordNumber}</span>
      ),
    },
    {
      header: 'Patient Details',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{r.patient?.name}</span>
          <span className="text-2xs text-slate-500">
            {r.patient?.patientId} • Blood: {r.patient?.bloodGroup}
          </span>
        </div>
      ),
    },
    {
      header: 'Diagnosis',
      render: (r) => (
        <span className="font-semibold text-slate-900 text-xs block max-w-xs truncate">
          {r.diagnosis}
        </span>
      ),
    },
    {
      header: 'Vitals Glance',
      render: (r) => (
        <div className="text-2xs text-slate-600 space-y-0.5">
          <span>BP: <strong className="text-slate-800">{r.vitals?.bloodPressure || 'N/A'}</strong></span> •{' '}
          <span>Pulse: <strong className="text-slate-800">{r.vitals?.heartRate || 'N/A'}</strong></span>
        </div>
      ),
    },
    {
      header: 'Attending Physician',
      render: (r) => (
        <span className="text-xs font-medium text-slate-800">
          Dr. {r.doctor?.user?.name || 'Physician'}
        </span>
      ),
    },
    {
      header: 'Visit Date',
      render: (r) => (
        <span className="text-xs text-slate-500">{formatDate(r.visitDate)}</span>
      ),
    },
    {
      header: 'View',
      className: 'text-right',
      render: (r) => (
        <button
          onClick={() => setSelectedRecord(r)}
          className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          title="View Full Clinical Notes"
        >
          <FaEye className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Clinical Medical Records
          </h1>
          <p className="text-xs text-slate-500">
            Comprehensive archive of patient examination notes, vital signs, and diagnostic assessments
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by record number, patient name, diagnosis..."
          className="max-w-md"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredRecords}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchRecords(p)}
        onRowClick={(r) => setSelectedRecord(r)}
        emptyTitle="No Medical Records Found"
        emptyDescription="Clinical examination notes will appear here once recorded by attending physicians."
      />

      {/* View Clinical Record Detail Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord?.diagnosis || 'Clinical Examination Details'}
        subtitle={`Record: ${selectedRecord?.recordNumber} • Patient: ${selectedRecord?.patient?.name}`}
        maxWidth="xl"
      >
        {selectedRecord && (
          <div className="space-y-4 text-xs">
            {/* Vitals Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-primary-50/60 p-3.5 rounded-xl border border-primary-200 text-xs">
              <div>
                <span className="text-2xs text-slate-500 block uppercase font-bold">Blood Pressure</span>
                <span className="font-extrabold text-slate-900">{selectedRecord.vitals?.bloodPressure || 'N/A'}</span>
              </div>
              <div>
                <span className="text-2xs text-slate-500 block uppercase font-bold">Heart Rate</span>
                <span className="font-extrabold text-slate-900">{selectedRecord.vitals?.heartRate ? `${selectedRecord.vitals.heartRate} bpm` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-2xs text-slate-500 block uppercase font-bold">Temperature</span>
                <span className="font-extrabold text-slate-900">{selectedRecord.vitals?.temperature ? `${selectedRecord.vitals.temperature} °F` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-2xs text-slate-500 block uppercase font-bold">Oxygen SpO2</span>
                <span className="font-extrabold text-slate-900">{selectedRecord.vitals?.oxygenSaturation ? `${selectedRecord.vitals.oxygenSaturation}%` : 'N/A'}</span>
              </div>
            </div>

            {selectedRecord.symptoms?.length > 0 && (
              <div>
                <span className="font-bold text-slate-900 block mb-1">Reported Symptoms:</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedRecord.symptoms.join(', ')}
                </p>
              </div>
            )}

            {selectedRecord.clinicalNotes && (
              <div>
                <span className="font-bold text-slate-900 block mb-1">Physician Observations & Findings:</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-line leading-relaxed">
                  {selectedRecord.clinicalNotes}
                </p>
              </div>
            )}

            {selectedRecord.treatmentPlan && (
              <div>
                <span className="font-bold text-slate-900 block mb-1">Treatment Plan & Follow-up:</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-line leading-relaxed">
                  {selectedRecord.treatmentPlan}
                </p>
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Close Record
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
