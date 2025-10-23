import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs';
import { EgresoForm } from '../components/EgresoForm';
import { useCuentas } from '../hooks/useBancos';
import { usePresupuesto } from '../hooks/usePresupuesto';
import { useProveedores } from '../hooks/useProveedores';
import { useEgreso, useDeleteEgreso, useUpdateEgreso } from '../hooks/useEgresos';
import { useUIStore } from '@shared/store/ui.store';
import { AuditTrail } from '@shared/components/AuditTrail';
import { Input } from '@shared/components/ui/input';
import { toast } from '@shared/hooks/useToast';

export const EgresoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEgreso(id);
  const { data: cuentas } = useCuentas();
  const { data: presupuesto } = usePresupuesto();
  const { data: proveedores } = useProveedores();
  const { mutateAsync: updateEgreso, isPending } = useUpdateEgreso();
  const { mutateAsync: deleteEgreso, isPending: isDeleting } = useDeleteEgreso();
  const [refPago, setRefPago] = useState('');
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Egresos', `Detalle ${id ?? ''}`]);
  }, [id, setBreadcrumb]);

  useEffect(() => {
    if (data?.refPago) setRefPago(data.refPago);
  }, [data?.refPago]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando egreso…</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Egreso no encontrado.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Egreso {data.concepto}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              if (data.estatus === 'PAGADO') {
                toast({ title: 'El egreso ya está marcado como pagado', variant: 'warning' });
                return;
              }
              await updateEgreso({ id: data.id, payload: { estatus: 'PAGADO', refPago } });
            }}
          >
            Registrar pago
          </Button>
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={async () => {
              await deleteEgreso(data.id);
              navigate('/tesoreria/egresos');
            }}
          >
            Eliminar
          </Button>
        </div>
      </div>
      <Tabs defaultValue="datos">
        <TabsList>
          <TabsTrigger value="datos">Datos</TabsTrigger>
          <TabsTrigger value="adjuntos">Adjuntos</TabsTrigger>
          <TabsTrigger value="bitacora">Bitácora</TabsTrigger>
        </TabsList>
        <TabsContent value="datos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Información general</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EgresoForm
                defaultValues={data}
                proveedores={proveedores ?? []}
                cuentas={cuentas ?? []}
                partidas={presupuesto?.partidas ?? []}
                loading={isPending}
                onSubmit={async (values) => {
                  await updateEgreso({ id: data.id, payload: values });
                }}
              />
              <div className="space-y-2">
                <p className="text-sm font-medium">Referencia de pago</p>
                <Input value={refPago} onChange={(event) => setRefPago(event.target.value)} placeholder="Folio de transferencia" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="adjuntos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos asociados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Los adjuntos se administran desde el CFDI del proveedor.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="bitacora" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Bitácora</CardTitle>
            </CardHeader>
            <CardContent>
              <AuditTrail entries={data.bitacora as any[]} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
