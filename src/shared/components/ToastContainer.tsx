import { useToast } from '../hooks/useToast';
import { cn } from '../lib/utils';

const variantStyles: Record<string, string> = {
  default: 'border border-border bg-background/95 backdrop-blur text-foreground',
  destructive: 'border border-red-200 bg-red-50 text-red-700',
  success: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border border-amber-200 bg-amber-50 text-amber-700'
};

export const ToastContainer = () => {
  const { toasts } = useToast();
  return (
    <div className="fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
      <div className="flex w-full max-w-md flex-col gap-2">
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              'rounded-lg px-4 py-3 shadow-lg transition-all',
              variantStyles[item.variant ?? 'default']
            )}
          >
            <p className="text-sm font-semibold">{item.title}</p>
            {item.description ? <p className="text-xs text-muted-foreground">{item.description}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
};
