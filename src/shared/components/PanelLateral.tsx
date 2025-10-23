import { ReactNode, useEffect } from 'react';
import { Button } from './ui/button';

interface PanelLateralProps {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const PanelLateral = ({ title, description, open, onClose, children }: PanelLateralProps) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-slate-900/60" aria-hidden onClick={onClose} />
      <aside className="relative z-10 ml-auto flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white p-6 shadow-2xl">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <Button variant="ghost" onClick={onClose} aria-label="Cerrar panel">
            Cerrar
          </Button>
        </header>
        <div className="space-y-4">{children}</div>
      </aside>
    </div>
  );
};
