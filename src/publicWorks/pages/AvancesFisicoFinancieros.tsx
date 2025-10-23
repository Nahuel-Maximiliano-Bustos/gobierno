import { useEffect, useMemo, useState } from 'react';
import { useUIStore } from '@shared/store/ui.store';
import { useObrasCatalogo } from '@publicWorks/hooks/useObrasCatalogo';
import { useAvances } from '@publicWorks/hooks/useAvances';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { Progress } from '@shared/components/ui/progress';
import { formatDate, downloadFile } from '@shared/lib/utils';
import { Button } from '@shared/components/ui/button';
import type { AvanceCurvaS } from '@publicWorks/types';
import { AlertTriangle, Download } from 'lucide-react';

export const AvancesFisicoFinancieros = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const { data: obras } = useObrasCatalogo({});
  const [obraId, setObraId] = useState<string>('');
  const { data: avances } = useAvances({ obraId: obraId || undefined });

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Avances físico-financieros']);
  }, [setBreadcrumb]);

  useEffect(() => {
    if (!obraId && obras?.length) {
      setObraId(obras[0].id);
    }
  }, [obras, obraId]);

  const ultimoAvance = avances?.[avances.length - 1];

  const desviacion = useMemo(() => {
    if (!ultimoAvance) return 0;
    return ultimoAvance.financieroReal - ultimoAvance.fisicoReal;
  }, [ultimoAvance]);

  const exportAvances = () => {
    if (!avances?.length) return;
    const header = 'Corte,% Físico programado,% Físico real,% Financiero programado,% Financiero real';
    const rows = avances.map((avance) =>
      [
        formatDate(avance.corte),
        avance.fisicoProgramado,
        avance.fisicoReal,
        avance.financieroProgramado,
        avance.financieroReal
      ].join(',')
    );
    downloadFile('avances-obra.csv', [header, ...rows].join('\n'), 'text/csv');
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Avances físico-financieros</h1>
          <p className="text-sm text-muted-foreground">Monitorea el comportamiento de la curva S y detecta desviaciones.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={obraId} onValueChange={setObraId}>
            <SelectTrigger className="w-72" aria-label="Seleccionar obra">
              <SelectValue placeholder="Selecciona la obra" />
            </SelectTrigger>
            <SelectContent>
              {obras?.map((obra) => (
                <SelectItem key={obra.id} value={obra.id}>
                  {obra.clave} · {obra.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportAvances} disabled={!avances?.length}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Corte más reciente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Corte al</p>
            <p className="text-xl font-semibold">
              {ultimoAvance ? formatDate(ultimoAvance.corte) : 'Sin registros'}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Avance físico real</p>
            <Progress value={ultimoAvance?.fisicoReal ?? 0} className="h-2" />
            <p className="text-sm font-semibold">{ultimoAvance?.fisicoReal ?? 0}%</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Avance financiero real</p>
            <Progress value={ultimoAvance?.financieroReal ?? 0} className="h-2 bg-primary/10 [&>div]:bg-primary" />
            <p className="text-sm font-semibold">{ultimoAvance?.financieroReal ?? 0}%</p>
          </div>
        </CardContent>
      </Card>

      {desviacion > 5 ? (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <AlertTriangle className="h-5 w-5" /> El avance financiero supera al físico por {desviacion.toFixed(1)}%. Verifique posibles desviaciones.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Curva S comparativa</CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox="0 0 100 60" className="h-64 w-full">
            <defs>
              <pattern id="gridAvances" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.4" />
              </pattern>
            </defs>
            <rect width="100" height="60" fill="url(#gridAvances)" rx="4" />
            <polyline
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.4"
              points={avances
                ?.map((avance, index, array) => {
                  const x = (index / Math.max(array.length - 1, 1)) * 100;
                  const y = 60 - (avance.fisicoReal / 100) * 55 - 3;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
            <polyline
              fill="none"
              stroke="#22c55e"
              strokeWidth="1.4"
              strokeDasharray="4 3"
              points={avances
                ?.map((avance, index, array) => {
                  const x = (index / Math.max(array.length - 1, 1)) * 100;
                  const y = 60 - (avance.financieroReal / 100) * 55 - 3;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
            <polyline
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="2 2"
              points={avances
                ?.map((avance, index, array) => {
                  const x = (index / Math.max(array.length - 1, 1)) * 100;
                  const y = 60 - (avance.fisicoProgramado / 100) * 55 - 3;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
          </svg>
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-6 rounded bg-sky-400" aria-hidden /> Físico real</span>
            <span className="flex items-center gap-1"><span className="h-2 w-6 rounded bg-emerald-500" aria-hidden /> Financiero real</span>
            <span className="flex items-center gap-1"><span className="h-2 w-6 rounded bg-slate-400" aria-hidden /> Plan programado</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de avances</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {(avances ?? []).map((avance: AvanceCurvaS) => (
            <div key={avance.id} className="rounded border border-border/70 px-3 py-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-foreground">{formatDate(avance.corte)}</span>
                <span>Físico real {avance.fisicoReal}%</span>
                <span>Financiero real {avance.financieroReal}%</span>
              </div>
              {avance.comentarios ? <p className="mt-1 text-muted-foreground">{avance.comentarios}</p> : null}
            </div>
          ))}
          {!avances?.length ? <p className="text-sm text-muted-foreground">Sin avances capturados para esta obra.</p> : null}
        </CardContent>
      </Card>
    </section>
  );
};

