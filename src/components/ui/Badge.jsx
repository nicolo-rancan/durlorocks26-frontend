import { cn } from '@/lib/utils';

const variants = {
  success: 'bg-green-500/15 text-green-400 border-green-500/30',
  danger: 'bg-red-500/15 text-red-400 border-red-500/30',
  warning: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  neutral: 'bg-surface-3 text-gray-400 border-surface-4',
  brand: 'bg-brand/15 text-brand border-brand/30',
  accent: 'bg-accent/15 text-accent border-accent/30',
};

export default function Badge({ variant = 'neutral', className, children }) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', variants[variant], className)}>
      {children}
    </span>
  );
}
