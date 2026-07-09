import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-brand hover:bg-brand-dark text-black font-semibold',
  secondary: 'bg-surface-3 hover:bg-surface-4 text-white border border-surface-4',
  danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold',
  ghost: 'hover:bg-surface-3 text-gray-400 hover:text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 rounded-xl',
  lg: 'px-6 py-3 text-lg rounded-xl',
  icon: 'p-2.5 rounded-xl',
};

export default function Button({ variant = 'primary', size = 'md', className, disabled, children, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
