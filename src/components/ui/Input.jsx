import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const Input = forwardRef(({ className, label, error, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
    <input
      ref={ref}
      className={cn(
        'w-full bg-surface-3 border border-surface-4 rounded-xl px-4 py-3 text-white placeholder-gray-600',
        'focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand',
        'transition-all duration-150',
        error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
        className
      )}
      {...props}
    />
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
));

Input.displayName = 'Input';
export default Input;
