import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  const s = status.toLowerCase();

  if (s.includes('active') || s.includes('paid') || s.includes('confirmed') || s.includes('issued') || s.includes('ready') || s.includes('current') || s.includes('accepted') || s.includes('completed') || s.includes('closed') || s.includes('approved')) {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (s.includes('awaiting') || s.includes('pending') || s.includes('quoted') || s.includes('requested') || s.includes('review') || s.includes('in progress') || s.includes('expiring soon')) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (s.includes('overdue') || s.includes('expired') || s.includes('failed') || s.includes('declined') || s.includes('high') || s.includes('immediate') || s.includes('actions outstanding') || s.includes('unpaid')) {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (s.includes('booked') || s.includes('sent') || s.includes('medium')) {
    colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
  } else if (s.includes('archived') || s.includes('draft') || s.includes('cancelled') || s.includes('void') || s.includes('superseded') || s.includes('low')) {
    colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border whitespace-nowrap ${px} ${colorClasses}`}
    >
      {status}
    </span>
  );
};
