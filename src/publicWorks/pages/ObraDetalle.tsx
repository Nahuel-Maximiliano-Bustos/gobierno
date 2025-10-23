import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUIStore } from '@shared/store/ui.store';
import { useObraDetalle } from '@publicWorks/hooks/useObrasCatalogo';
import { useExpedienteObra } from '@publicWorks/hooks/useExpedientes';
import { useObraEstimaciones } from '@publicWorks/hooks/useEstimaciones';
import { useBitacoraObra } from '@publicWorks/hooks/useBitacora';
import { useContratosObra } from '@publicWorks/hooks/useContratos';
import { useActasObra } from '@publicWorks/hooks/useActas';
import { useAvancesObra } from '@publicWorks/hooks/useAvances';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import { StatusBadge } from '@shared/components/StatusBadge';
import { formatCurrency, formatDate, downloadFile } from '@shared/lib/utils';
import { Button } from '@shared/components/ui/button';
import { AuditTrail } from '@shared/components/AuditTrail';
import { DataTable } from '@shared/components/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import type { ExpedienteDocumento, Estimacion, BitacoraEntrada, ContratoProcedimiento, Acta, AvanceCurvaS } from '@publicWorks/types';
import { Download } from 'lucide-react';
import { toast } from '@shared/hooks/useToast';

export const ObraDetalle = () => {
  const { id } = useParams();
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumen');
  const { data: detalle, isLoading } = useObraDetalle(id);
  const { data: documentos } = useExpedienteObra(id);
  const { data: estimaciones } = useObraEstimaciones(id);
  const { data: bitacora } = useBitacoraObra(id, {});
  const { data: contratos } = useContratosObra(id);
  const { data: actas } = useActasObra(id);
  const { data: avances } = useAvancesObra(id);

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Catálogo de Obras', detalle?.obra.nombre ?? `Obra ${id}`]);
  }, [setBreadcrumb, detalle?.obra.nombre, id]);

  const documentosColumns = useMemo<ColumnDef<ExpedienteDocumento>[]>(
    () => [
      { accessorKey: 'tipo', header: 'Documento' },
      {
        accessorKey: 'version',
        header: 'Versión',
        cell: ({ row }) => <Badge variant="outline">v{row.original.version}</Badge>
      },
      { accessorKey: 'responsable', header: 'Responsable' },
      {
        accessorKey: 'fecha',
        header: 'Fecha',
        cell: ({ row }) => formatDate(row.original.fecha)
      },
      {
        accessorKey: 'archivo.nombre',
        header: 'Archivo',
        cell: ({ row }) => (
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-primary"
            onClick={() => toast({ title: 'Descarga simulada', description: `Se descargará ${row.original.archivo.nombre}` })}
          >
            <Download className="h-4 w-4" /> {row.original.archivo.nombre}
          </button>
        )
      }
    ],
    []
  );

  const estimacionesColumns = useMemo<ColumnDef<Estimacion>[]>(
    () => [
      {
        accessorKey: 'periodo',
        header: 'Periodo',
        cell: ({ row }) => `Del ${formatDate(row.original.periodo.del)} al ${formatDate(row.original.periodo.al)}`
      },
      {
        accessorKey: 'importe.total',
        header: 'Total',
        cell: ({ row }) => formatCurrency(row.original.importe.total)
      },
      {
        accessorKey: 'estatus',
        header: 'Estatus',
        cell: ({ row }) => <StatusBadge status={row.original.estatus} />
      }
    ],
    []
  );

  const bitacoraColumns = useMemo<ColumnDef<BitacoraEntrada>[]>(
    () => [
      { accessorKey: 'fecha', header: 'Fecha', cell: ({ row }) => formatDate(row.original.fecha) },
      { accessorKey: 'tipo', header: 'Tipo', cell: ({ row }) => <Badge variant="outline">{row.original.tipo}</Badge> },
      { accessorKey: 'descripcion', header: 'Descripción' },
      { accessorKey: 'responsable', header: 'Responsable' }
    ],
    []
  );

  const contratosColumns = useMemo<ColumnDef<ContratoProcedimiento>[]>(
    () => [
      { accessorKey: 'modalidad', header: 'Modalidad' },
      { accessorKey: 'descripcion', header: 'Descripción' },
      {
        accessorKey: 'monto',
        header: 'Monto',
        cell: ({ row }) => formatCurrency(row.original.monto)
      },
      {
        accessorKey: 'plazos',
        header: 'Plazo',
        cell: ({ row }) => `${formatDate(row.original.fechas.convocatoria)} → ${formatDate(row.original.fechas.firma ?? row.original.fechas.fallo ?? row.original.fechas.convocatoria)}`
      }
    ],
    []
  );

  const actasColumns = useMemo<ColumnDef<Acta>[]>(
    () => [
      { accessorKey: 'tipo', header: 'Tipo' },
      {
        accessorKey: 'folio',
        header: 'Folio',
        cell: ({ row }) => <span className="font-medium">{row.original.folio}</span>
      },
      { accessorKey: 'fecha', header: 'Fecha', cell: ({ row }) => formatDate(row.original.fecha) },
      { accessorKey: 'estatus', header: 'Estatus', cell: ({ row }) => <StatusBadge status={row.original.estatus} /> }
    ],
    []
  );

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando información de la obra…</p>;
  }

  if (!detalle) {
    return <p className="text-sm text-muted-foreground">No se encontró la obra solicitada.</p>;
  }

  const obra = detalle.obra;
  const resumen = detalle.resumen;

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
    downloadFile(`${obra.clave}-avances.csv`, [header, ...rows].join('\n'), 'text/csv');
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{obra.nombre}</h1>
          <p className="text-sm text-muted-foreground">
            {obra.clave} · {obra.localidad} · {obra.modalidad ?? 'Sin modalidad'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={obra.estatus} />
          <Badge variant="outline">Fuente {obra.fuente}</Badge>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monto programado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(obra.montoProgramado)}</p>
            <p className="text-xs text-muted-foreground">Contratado {formatCurrency(obra.montoContratado)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monto ejercido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(resumen.montoEjercido)}</p>
            <p className="text-xs text-muted-foreground">Estimaciones registradas {resumen.estimacionesRegistradas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avance físico</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{obra.avance.fisico}%</p>
            <p className="text-xs text-muted-foreground">Financiero {obra.avance.financiero}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Seguimiento</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>Contratos vigentes: {resumen.contratosVigentes}</p>
            <p>Bitácora: {resumen.bitacoraEntradas} entradas</p>
            <p>Documentos: {resumen.documentosExpediente}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
          <TabsTrigger value="partidas">Partidas</TabsTrigger>
          <TabsTrigger value="estimaciones">Estimaciones</TabsTrigger>
          <TabsTrigger value="bitacora">Bitácora</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
          <TabsTrigger value="actas">Actas</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoría</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Programación oficial</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Inicio programado</p>
                <p className="font-medium">{obra.fechas.inicioProgramado ? formatDate(obra.fechas.inicioProgramado) : 'No definido'}</p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Término programado</p>
                <p className="font-medium">{obra.fechas.terminoProgramado ? formatDate(obra.fechas.terminoProgramado) : 'No definido'}</p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Actualización</p>
                <p className="font-medium">{formatDate(obra.avance.actualizadoEl)}</p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Riesgo</p>
                <p className="font-medium">{obra.riesgo ?? 'Sin riesgo'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Curva S de la obra</CardTitle>
                <p className="text-sm text-muted-foreground">Comparativo de avance programado vs real.</p>
              </div>
              <Button variant="outline" size="sm" onClick={exportAvances} disabled={!avances?.length}>
                <Download className="mr-2 h-4 w-4" /> Exportar CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full overflow-hidden rounded-lg border border-dashed border-border p-4">
                <svg viewBox="0 0 100 60" className="h-full w-full">
                  <defs>
                    <pattern id="gridObra" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.4" />
                    </pattern>
                  </defs>
                  <rect width="100" height="60" fill="url(#gridObra)" rx="4" />
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
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                    points={avances
                      ?.map((avance, index, array) => {
                        const x = (index / Math.max(array.length - 1, 1)) * 100;
                        const y = 60 - (avance.financieroReal / 100) * 55 - 3;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                </svg>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos">
          <DataTable data={documentos ?? []} columns={documentosColumns} />
          {!documentos?.length ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Aún no se cargan documentos. Utiliza la sección de expedientes para adjuntar archivos obligatorios.
            </p>
          ) : null}
        </TabsContent>

        <TabsContent value="cronograma" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hitos de la obra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {detalle.cronograma.map((evento) => (
                <div key={evento.fase} className="flex items-center justify-between rounded border border-border/60 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{evento.fase}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(evento.fecha)}</p>
                  </div>
                  <Badge variant="outline">{evento.porcentaje}%</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partidas">
          <Card>
            <CardHeader>
              <CardTitle>Partidas presupuestarias</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {detalle.partidas.map((partida) => (
                <div key={partida.clave} className="rounded border border-dashed border-border px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{partida.clave}</p>
                    <span className="text-xs text-muted-foreground">{partida.descripcion}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Programado</p>
                      <p className="font-medium">{formatCurrency(partida.montoProgramado)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ejercido</p>
                      <p className="font-medium">{formatCurrency(partida.montoEjercido)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estimaciones" className="space-y-3">
          <DataTable data={(estimaciones ?? []).slice(0, 5)} columns={estimacionesColumns} />
          <Button variant="outline" size="sm" onClick={() => navigate(`/obras/catalogo/${id}/estimaciones`)}>
            Ver todas las estimaciones
          </Button>
        </TabsContent>

        <TabsContent value="bitacora" className="space-y-3">
          <DataTable data={(bitacora ?? []).slice(0, 8)} columns={bitacoraColumns} />
          <Button variant="outline" size="sm" onClick={() => navigate(`/obras/catalogo/${id}/bitacora`)}>
            Ver bitácora completa
          </Button>
        </TabsContent>

        <TabsContent value="contratos" className="space-y-3">
          <DataTable data={contratos ?? []} columns={contratosColumns} />
          <Button variant="outline" size="sm" onClick={() => navigate(`/obras/catalogo/${id}/contratos`)}>
            Administrar contratos
          </Button>
        </TabsContent>

        <TabsContent value="actas" className="space-y-3">
          <DataTable data={actas ?? []} columns={actasColumns} />
          <Button variant="outline" size="sm" onClick={() => navigate('/obras/actas')}>
            Gestionar actas
          </Button>
        </TabsContent>

        <TabsContent value="auditoria">
          <AuditTrail entries={detalle.auditoria} />
        </TabsContent>
      </Tabs>
    </section>
  );
};
