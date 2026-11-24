import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import type { Pagination as PaginationType } from '../../types';

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
}) => {
  const { page, totalPages, total, limit } = pagination;

  if (totalPages <= 1) return null;

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-white">
      <div className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-800">{startRecord}</span> to{' '}
        <span className="font-semibold text-slate-800">{endRecord}</span> of{' '}
        <span className="font-semibold text-slate-800">{total}</span> results
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <FaChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-semibold px-3 py-1 bg-primary-50 text-primary-700 rounded-lg border border-primary-200">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <FaChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
