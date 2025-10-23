import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { IngresoForm } from '../components/IngresoForm';
import { useDeleteIngreso, useIngreso, useUpdateIngreso } from '../hooks/useIngresos';
import { useCuentas } from '../hooks/useBancos';
import { usePresupuesto } from '../hooks/usePresupuesto';
import { PanelLateral } from '@shared/components/PanelLateral';
import { AuditTrail } from '@shared/components/AuditTrail';
import { useUIStore } from '@shared/store/ui.store';

export const IngresoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useIngreso(id);
  const { data: cuentas } = useCuentas();
  const { data: presupuesto } = usePresupuesto();
  const { mutateAsync: updateIngreso, isPending } = useUpdateIngreso();
  const { mutateAsync: deleteIngreso, isPending: isDeleting } = useDeleteIngreso();
  const [panelOpen, setPanelOpen] = useState(false);
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Ingresos', `Detalle ${id ?? ''}`]);
  }, [id, setBreadcrumb]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando detalle del ingreso…</p>;
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">No se encontró el ingreso solicitado.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ingreso {data.referencia ?? data.id}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPanelOpen(true)}>
            Ver bitácora
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await deleteIngreso(data.id);
              navigate('/tesoreria/ingresos');
            }}
            disabled={isDeleting}
          >
            Eliminar
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Editar ingreso</CardTitle>
        </CardHeader>
        <CardContent>
          <IngresoForm
            defaultValues={data}
            cuentas={cuentas ?? []}
            partidas={presupuesto?.partidas ?? []}
            loading={isPending}
            onSubmit={async (values) => {
              await updateIngreso({ id: data.id, payload: values });
            }}
          />
        </CardContent>
      </Card>
      <PanelLateral title="Bitácora del ingreso" open={panelOpen} onClose={() => setPanelOpen(false)}>
        <AuditTrail entries={data.bitacora as any[]} />
      </PanelLateral>
    </div>
  );
};
