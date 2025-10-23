import { cn } from '../../lib/utils';

interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress = ({ value, className }: ProgressProps) => (
  <div className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}>
    <div
      className="h-full rounded-full bg-primary transition-all"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      role="progressbar"
    />
  </div>
);
