import React, { useEffect, useState } from 'react';
import { billingApi, paymentApi, patientApi } from '../../services/hospitalApi';
import { DataTable, type Column } from '../../components/tables/DataTable';
import { SearchInput } from '../../components/tables/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/modals/Modal';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Billing, Patient, Payment } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import {
  FaFileInvoiceDollar,
  FaPrint,
  FaMoneyBillWave,
  FaPlus,
  FaHospitalAlt,
  FaTrash
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export const BillingPage: React.FC = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });

  // View Invoice Modal State
  const [activeBillDetail, setActiveBillDetail] = useState<{ bill: Billing; payments: Payment[] } | null>(null);

  // Record Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [billToPay, setBillToPay] = useState<Billing | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'Cash' | 'Card' | 'UPI' | 'NetBanking' | 'Insurance'>('Card');
  const [payTxnId, setPayTxnId] = useState('');

  // Create Invoice Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [billItems, setBillItems] = useState([
    { description: 'Specialist Consultation Fee', category: 'Consultation', quantity: 1, unitPrice: 100 }
  ]);
  const [taxRate, setTaxRate] = useState(5);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    fetchBills(1);
    loadPatients();
  }, [statusFilter]);

  const loadPatients = async () => {
    try {
      const res = await patientApi.getAll({ limit: 100 });
      if (res.data.success) setPatients(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBills = async (page: number = 1) => {
    try {
      setLoading(true);
      const params: any = { page, limit: 15 };
      if (statusFilter) params.paymentStatus = statusFilter;
      const res = await billingApi.getAll(params);
      if (res.data.success) {
        setBills(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load billing invoices');
    } finally {
      setLoading(false);
    }
  };

  const openBillDetail = async (billId: string) => {
    try {
      const res = await billingApi.getById(billId);
      if (res.data.success) {
        setActiveBillDetail(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to retrieve invoice details');
    }
  };

  const openPaymentModal = (b: Billing) => {
    setBillToPay(b);
    setPayAmount(b.balanceAmount);
    setPayTxnId(`TXN-${Math.floor(10000000 + Math.random() * 90000000)}`);
    setIsPayModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billToPay || payAmount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    try {
      await paymentApi.record({
        billing: billToPay._id,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        transactionId: payTxnId,
        notes: `Settled via ${payMethod}`
      });
      toast.success('Payment recorded and receipt generated!');
      setIsPayModalOpen(false);
      setBillToPay(null);
      fetchBills(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment processing failed');
    }
  };

  const addBillItem = () => {
    setBillItems([
      ...billItems,
      { description: '', category: 'Consultation', quantity: 1, unitPrice: 0 }
    ]);
  };

  const removeBillItem = (idx: number) => {
    setBillItems(billItems.filter((_, i) => i !== idx));
  };

  const updateBillItem = (idx: number, field: string, val: any) => {
    const updated = [...billItems];
    (updated[idx] as any)[field] = val;
    setBillItems(updated);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || billItems.length === 0 || !billItems[0].description) {
      toast.error('Please select a patient and add at least one billed service');
      return;
    }

    try {
      await billingApi.create({
        patient: selectedPatient,
        items: billItems,
        taxRate: Number(taxRate),
        discountAmount: Number(discount)
      });
      toast.success('Patient invoice generated successfully!');
      setIsCreateModalOpen(false);
      setSelectedPatient('');
      setBillItems([{ description: 'Specialist Consultation Fee', category: 'Consultation', quantity: 1, unitPrice: 100 }]);
      fetchBills(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate invoice');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filtered = bills.filter((b) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      b.invoiceNumber?.toLowerCase().includes(s) ||
      b.patient?.name?.toLowerCase().includes(s) ||
      b.patient?.patientId?.toLowerCase().includes(s)
    );
  });

  const columns: Column<Billing>[] = [
    {
      header: 'Invoice No.',
      accessor: 'invoiceNumber',
      render: (b) => (
        <span className="font-bold text-xs text-primary-700">{b.invoiceNumber}</span>
      ),
    },
    {
      header: 'Patient Details',
      render: (b) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{b.patient?.name}</span>
          <span className="text-2xs text-slate-400">{b.patient?.patientId}</span>
        </div>
      ),
    },
    {
      header: 'Total Amount',
      render: (b) => (
        <span className="font-bold text-slate-900 text-xs">
          {formatCurrency(b.totalAmount)}
        </span>
      ),
    },
    {
      header: 'Paid / Balance',
      render: (b) => (
        <div className="text-xs">
          <span className="font-semibold text-emerald-700 block">
            Paid: {formatCurrency(b.paidAmount)}
          </span>
          <span className={`text-2xs font-bold ${b.balanceAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
            Balance: {formatCurrency(b.balanceAmount)}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (b) => <StatusBadge status={b.paymentStatus} size="sm" />,
    },
    {
      header: 'Due Date',
      render: (b) => <span className="text-xs text-slate-500">{formatDate(b.dueDate)}</span>,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (b) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => openBillDetail(b._id)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1"
          >
            <FaPrint className="w-3 h-3 text-slate-500" /> Invoice
          </button>
          {b.balanceAmount > 0 && (
            <button
              onClick={() => openPaymentModal(b)}
              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
            >
              <FaMoneyBillWave className="w-3 h-3" /> Pay
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
            Billing & Invoices
          </h1>
          <p className="text-xs text-slate-500">
            Itemized hospital invoices, consultation fees, test charges, and transaction receipts
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'receptionist') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition-colors"
          >
            <FaPlus className="w-3.5 h-3.5" /> + Create Patient Invoice
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by invoice number or patient name..."
          className="max-w-md"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
        >
          <option value="">All Payment Statuses</option>
          <option value="Paid">Paid in Full</option>
          <option value="Partially-Paid">Partially Paid</option>
          <option value="Unpaid">Unpaid (Outstanding)</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchBills(p)}
        emptyTitle="No Invoices Found"
        emptyDescription="Billing invoices generated for patient treatments will appear here."
      />

      {/* View Printable Invoice Sheet Modal */}
      <Modal
        isOpen={!!activeBillDetail}
        onClose={() => setActiveBillDetail(null)}
        title="Hospital Patient Invoice & Receipt"
        maxWidth="2xl"
      >
        {activeBillDetail && (
          <div className="space-y-6 printable-card text-xs">
            {/* Letterhead */}
            <div className="border-b-2 border-primary-600 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
                  <FaHospitalAlt className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                    AuraCare Hospital Network
                  </h2>
                  <p className="text-2xs text-slate-500">Official Billing & Financial Accounts Office</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-primary-700 block text-sm">
                  {activeBillDetail.bill.invoiceNumber}
                </span>
                <span className="text-2xs text-slate-500">
                  Date: {formatDate(activeBillDetail.bill.createdAt)}
                </span>
              </div>
            </div>

            {/* Bill To Info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-2xs text-slate-400 uppercase font-bold block">Billed To</span>
                <span className="font-bold text-sm text-slate-900 block">
                  {activeBillDetail.bill.patient?.name}
                </span>
                <span className="text-2xs text-slate-600">
                  Patient ID: {activeBillDetail.bill.patient?.patientId} • Phone: {activeBillDetail.bill.patient?.phone}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xs text-slate-400 uppercase font-bold block">Payment Status</span>
                <StatusBadge status={activeBillDetail.bill.paymentStatus} size="sm" />
                <span className="text-2xs text-slate-500 block mt-1">
                  Due: {formatDate(activeBillDetail.bill.dueDate)}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <table className="w-full text-left border-collapse border border-slate-200">
                <thead className="bg-slate-100 text-2xs uppercase text-slate-600">
                  <tr>
                    <th className="p-2.5 border border-slate-200">Description</th>
                    <th className="p-2.5 border border-slate-200">Category</th>
                    <th className="p-2.5 border border-slate-200 text-center">Qty</th>
                    <th className="p-2.5 border border-slate-200 text-right">Unit Price</th>
                    <th className="p-2.5 border border-slate-200 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeBillDetail.bill.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-2.5 border border-slate-200 font-medium text-slate-900">{item.description}</td>
                      <td className="p-2.5 border border-slate-200 text-slate-600">{item.category}</td>
                      <td className="p-2.5 border border-slate-200 text-center">{item.quantity}</td>
                      <td className="p-2.5 border border-slate-200 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-2.5 border border-slate-200 text-right font-bold text-slate-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Summary */}
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(activeBillDetail.bill.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({activeBillDetail.bill.taxRate}%):</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(activeBillDetail.bill.taxAmount)}</span>
                </div>
                {activeBillDetail.bill.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-{formatCurrency(activeBillDetail.bill.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-300 pt-1.5">
                  <span>Total Due:</span>
                  <span className="text-primary-700">{formatCurrency(activeBillDetail.bill.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-700 font-bold">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(activeBillDetail.bill.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-rose-600 font-bold border-t border-slate-200 pt-1">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(activeBillDetail.bill.balanceAmount)}</span>
                </div>
              </div>
            </div>

            {/* Previous Payments on Record */}
            {activeBillDetail.payments?.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Transaction Payment Log
                </span>
                <div className="space-y-1.5">
                  {activeBillDetail.payments.map((p) => (
                    <div key={p._id} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-2xs text-slate-600">
                      <span>{p.receiptNumber} • Method: {p.paymentMethod} • Txn: {p.transactionId || 'Direct'}</span>
                      <span className="font-bold text-emerald-700">{formatCurrency(p.amount)} ({formatDate(p.paymentDate)})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 no-print">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
              >
                <FaPrint className="w-3.5 h-3.5" /> Print Invoice
              </button>
              <button
                type="button"
                onClick={() => setActiveBillDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Record Invoice Settlement"
        subtitle={`Invoice: ${billToPay?.invoiceNumber} • Balance: ${formatCurrency(billToPay?.balanceAmount || 0)}`}
        maxWidth="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <FormInput
            label="Payment Amount ($)"
            type="number"
            step="0.01"
            max={billToPay?.balanceAmount}
            value={payAmount}
            onChange={(e) => setPayAmount(Number(e.target.value))}
            required
          />

          <FormSelect
            label="Payment Method"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value as any)}
            options={[
              { label: 'Credit / Debit Card', value: 'Card' },
              { label: 'Cash in Hand', value: 'Cash' },
              { label: 'UPI / Mobile Banking', value: 'UPI' },
              { label: 'Net Banking (EFT)', value: 'NetBanking' },
              { label: 'Health Insurance Claim', value: 'Insurance' },
            ]}
          />

          <FormInput
            label="Transaction / Reference ID"
            placeholder="TXN-984210"
            value={payTxnId}
            onChange={(e) => setPayTxnId(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate Patient Invoice"
        subtitle="Itemize hospital consultation, laboratory, or pharmacy fees"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <FormSelect
            label="Select Patient"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            options={[
              { label: '-- Select Patient --', value: '' },
              ...patients.map((p) => ({ label: `${p.name} (${p.patientId})`, value: p._id })),
            ]}
            required
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Billed Services & Supplies
              </span>
              <button
                type="button"
                onClick={addBillItem}
                className="text-2xs font-semibold text-primary-600 hover:text-primary-700"
              >
                + Add Service Item
              </button>
            </div>

            {billItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold text-slate-500 uppercase">Item #{idx + 1}</span>
                  {billItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBillItem(idx)}
                      className="text-rose-500 hover:text-rose-700 text-xs"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    placeholder="Description (e.g. Consultation or CBC Test)"
                    value={item.description}
                    onChange={(e) => updateBillItem(idx, 'description', e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg bg-white"
                    required
                  />
                  <select
                    value={item.category}
                    onChange={(e) => updateBillItem(idx, 'category', e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Room">Room & Bed</option>
                    <option value="Procedure">Procedure / Surgery</option>
                    <option value="Nursing">Nursing Care</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-2xs text-slate-500 block mb-0.5">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateBillItem(idx, 'quantity', Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-2xs text-slate-500 block mb-0.5">Unit Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => updateBillItem(idx, 'unitPrice', Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Tax Rate (%)"
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
            />
            <FormInput
              label="Discount Amount ($)"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>

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
              Generate Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
