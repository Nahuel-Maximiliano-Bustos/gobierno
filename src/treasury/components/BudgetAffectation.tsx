import type { Partida } from '@treasury/types';
import { formatCurrency } from '@shared/lib/utils';
import { Progress } from '@shared/components/ui/progress';

interface BudgetAffectationProps {
  partida?: Partida & { comprometido?: number; devengado?: number; pagado?: number };
  importe?: number;
}

export const BudgetAffectation = ({ partida, importe = 0 }: BudgetAffectationProps) => {
  if (!partida) {
    return <p className="text-sm text-muted-foreground">Seleccione una partida para visualizar su disponibilidad.</p>;
  }

  const comprometido = partida.comprometido ?? 0;
  const disponible = partida.disponible ?? 0;
  const impacto = importe + comprometido;
  const porcentaje = partida.disponible > 0 ? Math.min(100, Math.round((impacto / (disponible + comprometido)) * 100)) : 0;

  return (
    <div className="space-y-2 rounded-lg border border-border p-4 text-sm">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{partida.clave} · {partida.nombre}</span>
        <span>Capítulo {partida.capitulo}</span>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <p>Disponible actual: {formatCurrency(disponible)}</p>
        <p>Comprometido: {formatCurrency(comprometido)}</p>
        <p>Importe a afectar: {formatCurrency(importe)}</p>
        <p>Disponible post-afectación: {formatCurrency(disponible - importe)}</p>
      </div>
      <Progress value={porcentaje} />
      <p className="text-xs text-muted-foreground">
        El compromiso consume {porcentaje}% del techo financiero disponible en esta partida.
      </p>
    </div>
  );
};
