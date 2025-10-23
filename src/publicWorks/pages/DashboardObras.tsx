import { useMemo, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useUIStore } from '@shared/store/ui.store';
import { useObrasDashboard, type ObrasDashboardData } from '@publicWorks/hooks/useObrasDashboard';
import { KPIStat } from '@publicWorks/components/KPIStat';
import { ChartCard } from '@publicWorks/components/ChartCard';
import { DataTable } from '@shared/components/DataTable';
import { Badge } from '@shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { formatCurrency } from '@shared/lib/utils';

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const buildDonutGradient = (segments: Array<{ color: string; value: number }>) => {
  const total = segments.reduce((sum, item) => sum + item.value, 0) || 1;
  let current = 0;
  return segments
    .map((segment) => {
      const start = (current / total) * 100;
      current += segment.value;
      const end = (current / total) * 100;
      return `${segment.color} ${start}% ${end}%`;
    })
    .join(', ');
};

export const DashboardObras = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const { data, isLoading, refetch, isFetching } = useObrasDashboard();

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Dashboard']);
  }, [setBreadcrumb]);

  type AlertRow = ObrasDashboardData['obrasAlerta'][number];

  const alertColumns = useMemo<ColumnDef<AlertRow>[]>(
    () => [
      { accessorKey: 'obra', header: 'Obra / Localidad', cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.obra}</p>
          <p className="text-xs text-muted-foreground">{row.original.localidad}</p>
        </div>
      ) },
      { accessorKey: 'fuente', header: 'Fuente', cell: ({ row }) => <Badge variant="outline">{row.original.fuente}</Badge> },
      { accessorKey: 'monto', header: 'Monto contratado', cell: ({ row }) => (
        <span className="font-medium">{formatCurrency(row.original.monto)}</span>
      ) },
      {
        accessorKey: 'avanceFisico',
        header: '% físico / % financiero',
        cell: ({ row }) => (
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-10 rounded-full bg-emerald-400" aria-hidden />
              Físico {formatPercent(row.original.avanceFisico)}
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-10 rounded-full bg-sky-500" aria-hidden />
              Financiero {formatPercent(row.original.avanceFinanciero)}
            </div>
          </div>
        )
      },
      {
        accessorKey: 'diasAtraso',
        header: 'Atraso',
        cell: ({ row }) => (
          <div className="text-xs">
            <p className="font-semibold text-red-600">{row.original.diasAtraso} días</p>
            <p className="text-muted-foreground">Desviación {formatPercent(row.original.desviacion)}</p>
          </div>
        )
      }
    ],
    []
  );

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando panorama de Obras Públicas…</p>;
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">No hay datos registrados en el módulo de Obras.</p>;
  }

  const totalObras = data.totalProgramadas + data.totalProceso + data.totalTerminadas;
  const donutGradient = buildDonutGradient([
    { color: '#0ea5e9', value: data.estatusDistribucion.find((item) => item.estatus === 'Programada')?.total ?? 0 },
    { color: '#22c55e', value: data.estatusDistribucion.find((item) => item.estatus === 'En proceso')?.total ?? 0 },
    { color: '#475569', value: data.estatusDistribucion.find((item) => item.estatus === 'Terminada')?.total ?? 0 },
    { color: '#f97316', value: data.estatusDistribucion.find((item) => item.estatus === 'Suspendida')?.total ?? 0 },
    { color: '#f43f5e', value: data.estatusDistribucion.find((item) => item.estatus === 'Cancelada')?.total ?? 0 }
  ]);

  const maxMonto = Math.max(...data.financiacionPorFuente.map((item) => item.programado), 1);

  const avanceFisicoSerie = data.avanceTemporal.map((item) => item.fisico);
  const avanceFinancieroSerie = data.avanceTemporal.map((item) => item.financiero);
  const maxAvance = Math.max(...avanceFisicoSerie, ...avanceFinancieroSerie, 100);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard de Obras Públicas</h1>
          <p className="text-sm text-muted-foreground">
            Corte al {new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(data.fechaCorte))}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-md border border-border px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10"
          disabled={isFetching}
        >
          {isFetching ? 'Actualizando…' : 'Actualizar tablero'}
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KPIStat
          title="Obras programadas"
          value={data.totalProgramadas}
          subtitle={`De ${totalObras} en total`}
          format="number"
          accent="sky"
          hint="Incluye obras calendarizadas con expediente aprobado"
        />
        <KPIStat
          title="Obras en proceso"
          value={data.totalProceso}
          subtitle="Con supervisión activa"
          format="number"
          accent="emerald"
          trend={{ value: data.avanceFisicoPromedio, label: 'Avance físico promedio' }}
        />
        <KPIStat
          title="Obras terminadas"
          value={data.totalTerminadas}
          subtitle="Listas para cierre administrativo"
          format="number"
          accent="slate"
        />
        <KPIStat
          title="Monto programado"
          value={data.montoProgramado}
          format="currency"
          subtitle="Planificado en el POA"
          accent="sky"
        />
        <KPIStat
          title="Monto ejercido"
          value={data.montoEjercido}
          format="currency"
          subtitle="Comprometido vía estimaciones"
          accent="emerald"
          trend={{ value: data.avanceFinancieroPromedio, label: 'Avance financiero promedio' }}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Programado vs ejercido por fuente"
          description="Montos acumulados por fuente de financiamiento"
          footer="Los montos consideran modificatorios autorizados y ajustes vigentes."
        >
          <div className="space-y-3">
            {data.financiacionPorFuente.map((item) => (
              <div key={item.fuente} className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{item.fuente}</span>
                  <span>{formatCurrency(item.programado)}</span>
                </div>
                <div className="relative h-3 rounded-full bg-slate-200">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-sky-400/70"
                    style={{ width: `${Math.min(100, (item.programado / maxMonto) * 100)}%` }}
                    aria-hidden
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(100, (item.ejercido / maxMonto) * 100)}%` }}
                    aria-hidden
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Ejercido {formatCurrency(item.ejercido)}</span>
                  <span>
                    {item.programado === 0
                      ? '0%'
                      : `${((item.ejercido / item.programado) * 100).toFixed(1)}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Evolución de avance" description="Curva S físico vs financiero">
          <svg viewBox="0 0 100 60" className="h-full w-full" aria-label="Curva S">
            <rect width="100" height="60" rx="4" fill="url(#gridLines)" />
            <defs>
              <pattern id="gridLines" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
              </pattern>
            </defs>
            <polyline
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="1.5"
              points={data.avanceTemporal
                .map((item, index, array) => {
                  const x = (index / Math.max(array.length - 1, 1)) * 100;
                  const y = 60 - (item.fisico / maxAvance) * 55 - 3;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
            <polyline
              fill="none"
              stroke="#22c55e"
              strokeWidth="1.5"
              points={data.avanceTemporal
                .map((item, index, array) => {
                  const x = (index / Math.max(array.length - 1, 1)) * 100;
                  const y = 60 - (item.financiero / maxAvance) * 55 - 3;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
          </svg>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2"><span className="inline-block h-2 w-6 rounded bg-sky-500" aria-hidden />Físico</span>
            <span className="flex items-center gap-2"><span className="inline-block h-2 w-6 rounded bg-emerald-500" aria-hidden />Financiero</span>
          </div>
        </ChartCard>

        <ChartCard title="Distribución por estatus" description={`${totalObras} obras activas`}>
          <div className="flex items-center justify-center gap-6">
            <div
              className="relative h-40 w-40 rounded-full"
              style={{ background: `conic-gradient(${donutGradient})` }}
              role="img"
              aria-label="Distribución de obras por estatus"
            >
              <div className="absolute inset-6 rounded-full bg-white" />
              <div className="absolute inset-10 flex flex-col items-center justify-center text-sm font-semibold text-slate-700">
                <span>{totalObras}</span>
                <span className="text-xs font-normal text-muted-foreground">Obras</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              {data.estatusDistribucion.map((item) => (
                <li key={item.estatus} className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        item.estatus === 'Programada'
                          ? '#0ea5e9'
                          : item.estatus === 'En proceso'
                          ? '#22c55e'
                          : item.estatus === 'Terminada'
                          ? '#475569'
                          : item.estatus === 'Suspendida'
                          ? '#f97316'
                          : '#f43f5e'
                    }}
                    aria-hidden
                  />
                  <span className="w-28">{item.estatus}</span>
                  <span className="font-medium">{item.total}</span>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Obras con riesgo</CardTitle>
            <p className="text-xs text-muted-foreground">Semáforo por retraso o desviación mayor al umbral.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.obrasRiesgo.map((obra) => (
              <div key={obra.id} className="rounded-lg border border-amber-200 bg-amber-50/80 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-amber-800">{obra.nombre}</p>
                  <Badge variant="warning">{obra.riesgo}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{obra.localidad} · {obra.fuente}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded bg-white/80 p-2">
                    <p className="text-muted-foreground">Atraso</p>
                    <p className="font-semibold text-red-600">{obra.diasAtraso} días</p>
                  </div>
                  <div className="rounded bg-white/80 p-2">
                    <p className="text-muted-foreground">Desviación</p>
                    <p className="font-semibold text-amber-600">{formatPercent(obra.desviacionFinanciera)}</p>
                  </div>
                </div>
              </div>
            ))}
            {data.obrasRiesgo.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin riesgos registrados al corte.</p>
            ) : null}
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Obras con alerta</CardTitle>
              <p className="text-xs text-muted-foreground">Desviación financiera o atraso mayor al umbral configurado.</p>
            </CardHeader>
            <CardContent>
              <DataTable
                data={data.obrasAlerta}
                columns={alertColumns}
                searchPlaceholder="Buscar obra o localidad"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
