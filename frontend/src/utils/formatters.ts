import dayjs from 'dayjs';

export const formatCurrency = (amount: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: string | Date | undefined, format: string = 'MMM D, YYYY'): string => {
  if (!date) return 'N/A';
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date | undefined): string => {
  if (!date) return 'N/A';
  return dayjs(date).format('MMM D, YYYY h:mm A');
};

export const getStatusBadgeClass = (status: string): string => {
  const s = status?.toLowerCase() || '';
  if (['confirmed', 'completed', 'paid', 'active', 'in-stock', 'normal'].includes(s)) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
  }
  if (['pending', 'in-progress', 'in-consultation', 'partially-paid', 'low-stock', 'urgent'].includes(s)) {
    return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
  }
  if (['cancelled', 'no-show', 'unpaid', 'terminated', 'out-of-stock', 'critical', 'stat', 'abnormal'].includes(s)) {
    return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';
  }
  return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20';
};
