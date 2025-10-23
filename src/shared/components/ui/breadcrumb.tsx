import { Slash } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Breadcrumb = ({ items }: { items: string[] }) => {
  if (!items?.length) return null;
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="flex items-center gap-1">
          <span className={cn(index === items.length - 1 && 'text-foreground font-medium')}>{item}</span>
          {index < items.length - 1 ? <Slash className="h-3 w-3 opacity-50" /> : null}
        </span>
      ))}
    </nav>
  );
};
