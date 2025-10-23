import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs';
import { Button } from '@shared/components/ui/button';
import { StatusBadge } from '@shared/components/StatusBadge';
import { formatCurrency, formatDate } from '@shared/lib/utils';
import { BudgetAffectation } from '../components/BudgetAffectation';
import { CFDIViewer } from '@shared/components/CFDIViewer';
import { AuditTrail } from '@shared/components/AuditTrail';
import { useCompromiso, useCompromisoTransition } from '../hooks/useCompromisos';
import { usePresupuesto } from '../hooks/usePresupuesto';
import { useUIStore } from '@shared/store/ui.store';
import { usePermissions } from '@shared/hooks/usePermissions';
import type { EstatusCompromiso } from '@treasury/types';
import { toast } from '@shared/hooks/useToast';

const nextActions: Partial<Record<EstatusCompromiso, EstatusCompromiso[]>> = {
  BORRADOR: ['REVISION'],
  REVISION: ['RECHAZADO', 'AUTORIZADO'],
  AUTORIZADO: ['PAGADO'],
  PAGADO: ['CERRADO']
};

export const CompromisoDetail = () => {
  const { id } = useParams();
  const { data, isLoading, refetch } = useCompromiso(id);
  const { data: presupuesto } = usePresupuesto();
  const { has } = usePermissions();
  const { mutateAsync, isPending } = useCompromisoTransition();
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const navigate = useNavigate();

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Compromisos de Pago', `Detalle ${id ?? ''}`]);
  }, [id, setBreadcrumb]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando compromiso…</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Compromiso no encontrado.</p>;

  const partida = presupuesto?.partidas.find((item) => item.clave === data.partida);
  const acciones = nextActions[data.estatus] ?? [];

  const ejecutarTransicion = async (estatus: EstatusCompromiso) => {
    if (!has('AUTORIZAR') && estatus === 'AUTORIZADO') {
      toast({ title: 'Sin permisos', description: 'Se requiere permiso de autorización.', variant: 'warning' });
      return;
    }
    let motivo: string | undefined;
    let refPago: string | undefined;
    let fechaPago: string | undefined;
    if (estatus === 'RECHAZADO') {
      motivo = window.prompt('Indique el motivo del rechazo:') ?? '';
      if (!motivo) return;
    }
    if (estatus === 'PAGADO') {
      refPago = window.prompt('Folio de pago capturado:') ?? '';
      fechaPago = window.prompt('Fecha de pago (YYYY-MM-DD):', new Date().toISOString().slice(0, 10)) ?? '';
    }
    await mutateAsync({ id: data.id, estatus, motivo, refPago, fechaPago });
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{data.concepto}</h1>
          <p className="text-sm text-muted-foreground">
            Programado para {formatDate(data.fechaProgramada)} · {data.proveedor.nombre}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={data.estatus} />
          {acciones.map((accion) => (
            <Button key={accion} size="sm" onClick={() => ejecutarTransicion(accion)} disabled={isPending}>
              {accion}
            </Button>
          ))}
        </div>
      </div>
      <Tabs defaultValue="datos">
        <TabsList>
          <TabsTrigger value="datos">Datos</TabsTrigger>
          <TabsTrigger value="presupuesto">Presupuesto</TabsTrigger>
          <TabsTrigger value="adjuntos">Adjuntos</TabsTrigger>
          <TabsTrigger value="bitacora">Bitácora</TabsTrigger>
        </TabsList>
        <TabsContent value="datos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del compromiso</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Proveedor</p>
                <p className="text-sm text-muted-foreground">{data.proveedor.nombre}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Importe</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(data.importe)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Fecha documento</p>
                <p className="text-sm text-muted-foreground">{formatDate(data.fechaDocumento)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Fecha programada</p>
                <p className="text-sm text-muted-foreground">{formatDate(data.fechaProgramada)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Banco</p>
                <p className="text-sm text-muted-foreground">{data.banco ?? 'No definido'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Referencia</p>
                <p className="text-sm text-muted-foreground">{data.refPago ?? '—'}</p>
              </div>
              <div className="md:col-span-2">
                <CFDIViewer uuid={data.uuid} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="presupuesto" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Afectación presupuestal</CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetAffectation partida={partida} importe={data.importe} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="adjuntos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Adjuntos cargados</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {data.adjuntos?.map((adjunto) => (
                  <li key={adjunto.id} className="flex items-center justify-between rounded border border-border/80 px-3 py-2">
                    <span>{adjunto.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => toast({ title: 'Descarga simulada', description: adjunto.name })}>
                      Descargar
                    </Button>
                  </li>
                ))}
              </ul>
              {!data.adjuntos?.length ? <p className="text-sm text-muted-foreground">Sin adjuntos registrados.</p> : null}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bitacora" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Bitácora de acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <AuditTrail entries={data.bitacora} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Button variant="outline" onClick={() => navigate('/tesoreria/compromisos')}>
        Regresar a la lista
      </Button>
    </div>
  );
};
