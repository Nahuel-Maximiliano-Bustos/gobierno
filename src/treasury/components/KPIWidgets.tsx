import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Progress } from '@shared/components/ui/progress';
import { formatCurrency, formatDate } from '@shared/lib/utils';
import type { DashboardData } from '../hooks/useDashboard';
import { Badge } from '@shared/components/ui/badge';

interface KPIWidgetsProps {
  data?: DashboardData;
  isLoading: boolean;
}

export const KPIWidgets = ({ data, isLoading }: KPIWidgetsProps) => {
  const avance = useMemo(() => {
    if (!data) return 0;
    return Math.min(100, Math.round((data.ingresosMes / data.metaMensual) * 100));
  }, [data]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando indicadores financieros…</p>;
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Sin datos aún. Capture ingresos y egresos para visualizar KPIs.</p>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Ingresos del mes</CardTitle>
          <CardDescription>Meta mensual {formatCurrency(data.metaMensual)}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-primary">{formatCurrency(data.ingresosMes)}</p>
          <Progress value={avance} className="mt-3" />
          <p className="mt-1 text-xs text-muted-foreground">Avance {avance}%</p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Egresos por capítulo</CardTitle>
          <CardDescription>Distribución del mes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(data.egresosCapitulo).map(([capitulo, importe]) => (
            <div key={capitulo}>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Capítulo {capitulo}</span>
                <span>{formatCurrency(importe)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-amber-500"
                  style={{ width: `${Math.min(100, (importe / data.metaMensual) * 100)}%` }}
                />
              </div>
            </div>
          ))}
          {Object.keys(data.egresosCapitulo).length === 0 ? (
            <p className="text-xs text-muted-foreground">Aún no hay egresos capturados este mes.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Compromisos por vencer</CardTitle>
          <CardDescription>Próximos 7 días</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.compromisosPorVencer.slice(0, 4).map((comp) => (
            <div key={comp.id} className="rounded border border-border/80 p-2">
              <p className="text-sm font-medium text-foreground">{comp.concepto}</p>
              <p className="text-xs text-muted-foreground">
                Programado para {formatDate(comp.fechaProgramada)} · {formatCurrency(comp.importe)}
              </p>
            </div>
          ))}
          {data.compromisosPorVencer.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin compromisos próximos a vencer.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Alertas de conciliación</CardTitle>
          <CardDescription>Movimientos sin conciliar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.alertasConciliacion.slice(0, 4).map((mov) => (
            <div key={mov.id} className="flex items-center justify-between rounded border border-red-100 bg-red-50 p-2 text-xs text-red-700">
              <span>{mov.concepto}</span>
              <span>{formatDate(mov.fecha)}</span>
            </div>
          ))}
          {data.alertasConciliacion.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin diferencias relevantes.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="lg:col-span-6">
        <CardHeader>
          <CardTitle>Bitácora reciente</CardTitle>
          <CardDescription>Últimos movimientos registrados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.bitacoraReciente.map((item) => (
            <div key={`${item.ts}-${item.action}`} className="flex items-center justify-between rounded border border-dashed border-border px-3 py-2 text-sm">
              <div>
                <p className="font-medium">{item.action}</p>
                <p className="text-xs text-muted-foreground">{item.entidad}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{item.user}</p>
                <p>{formatDate(item.ts)}</p>
              </div>
            </div>
          ))}
          {data.bitacoraReciente.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin eventos registrados.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="lg:col-span-6">
        <CardHeader>
          <CardTitle>Tareas del día</CardTitle>
          <CardDescription>Autorizaciones y revisiones pendientes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.tareasHoy.map((tarea) => (
            <div key={tarea.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">{tarea.concepto}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(tarea.fechaDocumento)} · {formatCurrency(tarea.importe)}
                </p>
              </div>
              <Badge variant="warning">{tarea.estatus}</Badge>
            </div>
          ))}
          {data.tareasHoy.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin tareas pendientes. ¡Buen trabajo!</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
