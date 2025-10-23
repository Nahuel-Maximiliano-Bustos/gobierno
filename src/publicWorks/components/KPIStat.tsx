import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';
import { cn, formatCurrency } from '@shared/lib/utils';

interface KPIStatProps {
  title: string;
  value: number | string;
  subtitle?: string;
  hint?: string;
  format?: 'number' | 'currency' | 'percent';
  trend?: {
    value: number;
    label?: string;
  };
  accent?: 'emerald' | 'amber' | 'sky' | 'slate';
}

const accentMap: Record<Exclude<KPIStatProps['accent'], undefined>, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  sky: 'bg-sky-100 text-sky-700',
  slate: 'bg-slate-100 text-slate-600'
};

const formatValue = (value: KPIStatProps['value'], mode: KPIStatProps['format']) => {
  if (typeof value === 'string') return value;
  if (mode === 'currency') return formatCurrency(value);
  if (mode === 'percent') return `${value.toFixed(1)}%`;
  return new Intl.NumberFormat('es-MX').format(value);
};

export const KPIStat = ({ title, value, subtitle, hint, format = 'number', trend, accent = 'slate' }: KPIStatProps) => (
  <Card>
    <CardHeader className="space-y-1">
      <CardTitle className="text-base font-semibold">{title}</CardTitle>
      {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-start gap-2">
        <span className="break-all text-[clamp(1.6rem,4.5vw,2.2rem)] font-semibold leading-tight text-foreground">
          {formatValue(value, format)}
        </span>
        {trend ? (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              accentMap[accent]
            )}
          >
            {trend.value > 0 ? '▲' : trend.value < 0 ? '▼' : '•'} {Math.abs(trend.value).toFixed(1)}%
            {trend.label ? ` · ${trend.label}` : ''}
          </span>
        ) : null}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </CardContent>
  </Card>
);
