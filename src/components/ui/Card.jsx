import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div className={cn('bg-surface-2 border border-surface-4 rounded-2xl', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn('px-5 pt-5 pb-3', className)}>{children}</div>;
}

export function CardContent({ className, children }) {
  return <div className={cn('px-5 pb-5', className)}>{children}</div>;
}
