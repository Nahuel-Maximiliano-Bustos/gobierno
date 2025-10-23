import { Checkbox } from '@shared/components/ui/checkbox';
import { Button } from '@shared/components/ui/button';
import { formatCurrency, formatDate } from '@shared/lib/utils';
import type { MovimientoBancario } from '@treasury/types';
import { useState } from 'react';

interface BankMatchTableProps {
  movimientos: MovimientoBancario[];
  onToggle: (ids: string[], conciliado: boolean) => void;
}

export const BankMatchTable = ({ movimientos, onToggle }: BankMatchTableProps) => {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggle = (id: string, value: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: value }));
  };

  const selectedIds = Object.entries(selected)
    .filter(([, value]) => value)
    .map(([key]) => key);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={selectedIds.length === 0}
          onClick={() => onToggle(selectedIds, true)}
        >
          Confirmar conciliación
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={selectedIds.length === 0}
          onClick={() => onToggle(selectedIds, false)}
        >
          Marcar investigación
        </Button>
        <span className="text-xs text-muted-foreground">{selectedIds.length} seleccionados</span>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="w-10 px-2 py-2 text-left">
                <Checkbox
                  checked={selectedIds.length === movimientos.length && movimientos.length > 0}
                  indeterminate={selectedIds.length > 0 && selectedIds.length < movimientos.length}
                  onCheckedChange={(value) => {
                    const next: Record<string, boolean> = {};
                    movimientos.forEach((mov) => {
                      next[mov.id] = Boolean(value);
                    });
                    setSelected(next);
                  }}
                />
              </th>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Concepto</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-right">Importe</th>
              <th className="px-3 py-2 text-left">Referencia</th>
              <th className="px-3 py-2 text-center">Conciliado</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((mov) => (
              <tr key={mov.id} className="border-t border-border/80 hover:bg-muted/30">
                <td className="px-2 py-2">
                  <Checkbox checked={selected[mov.id] ?? false} onCheckedChange={(value) => toggle(mov.id, Boolean(value))} />
                </td>
                <td className="px-3 py-2 text-xs">{formatDate(mov.fecha)}</td>
                <td className="px-3 py-2">{mov.concepto}</td>
                <td className="px-3 py-2 text-xs">{mov.tipo}</td>
                <td className="px-3 py-2 text-right font-medium">{formatCurrency(mov.importe)}</td>
                <td className="px-3 py-2 text-xs">{mov.ref ?? '—'}</td>
                <td className="px-3 py-2 text-center text-xs">
                  {mov.conciliado ? 'Sí' : 'No'}
                </td>
              </tr>
            ))}
            {movimientos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No hay movimientos en el periodo seleccionado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};
