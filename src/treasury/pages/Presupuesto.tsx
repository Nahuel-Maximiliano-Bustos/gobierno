import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { usePresupuesto, useModificarPresupuesto } from '../hooks/usePresupuesto';
import { formatCurrency } from '@shared/lib/utils';
import { useUIStore } from '@shared/store/ui.store';
import { toast } from '@shared/hooks/useToast';

export const PresupuestoPage = () => {
  const { data, isLoading } = usePresupuesto();
  const { mutateAsync, isPending } = useModificarPresupuesto();
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const [partida, setPartida] = useState('');
  const [monto, setMonto] = useState(0);
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Presupuesto']);
  }, [setBreadcrumb]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando presupuesto…</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Sin presupuesto cargado.</p>;

  const totalDisponible = data.partidas.reduce((sum, partida) => sum + (partida.disponible ?? 0), 0);
  const totalPagado = data.partidas.reduce((sum, partida) => sum + ((partida as any).pagado ?? 0), 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Resumen presupuestal {data.ejercicio}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Disponible total</p>
            <p className="text-2xl font-semibold">{formatCurrency(totalDisponible)}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Pagado</p>
            <p className="text-2xl font-semibold text-primary">{formatCurrency(totalPagado)}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Detalle por partida</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Partida</th>
                <th className="px-3 py-2 text-left">Capítulo</th>
                <th className="px-3 py-2 text-left">Nombre</th>
                <th className="px-3 py-2 text-right">Disponible</th>
                <th className="px-3 py-2 text-right">Comprometido</th>
                <th className="px-3 py-2 text-right">Devengado</th>
                <th className="px-3 py-2 text-right">Pagado</th>
              </tr>
            </thead>
            <tbody>
              {data.partidas.map((item) => (
                <tr key={item.clave} className="border-t border-border/70">
                  <td className="px-3 py-2">{item.clave}</td>
                  <td className="px-3 py-2">{item.capitulo}</td>
                  <td className="px-3 py-2">{item.nombre}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(item.disponible ?? 0)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency((item as any).comprometido ?? 0)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency((item as any).devengado ?? 0)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency((item as any).pagado ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Registrar modificación presupuestal</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input placeholder="Partida" value={partida} onChange={(event) => setPartida(event.target.value)} />
          <Input
            type="number"
            step="0.01"
            placeholder="Monto"
            value={monto}
            onChange={(event) => setMonto(Number(event.target.value))}
          />
          <Input placeholder="Motivo" value={motivo} onChange={(event) => setMotivo(event.target.value)} />
          <Button
            onClick={async () => {
              if (!partida || !monto || !motivo) {
                toast({ title: 'Complete la información', variant: 'warning' });
                return;
              }
              await mutateAsync({ partida, monto, motivo });
              setPartida('');
              setMonto(0);
              setMotivo('');
            }}
            disabled={isPending}
          >
            Guardar modificación
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
