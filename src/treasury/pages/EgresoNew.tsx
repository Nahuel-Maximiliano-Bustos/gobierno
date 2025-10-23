import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { EgresoForm } from '../components/EgresoForm';
import { useCreateEgreso } from '../hooks/useEgresos';
import { useCuentas } from '../hooks/useBancos';
import { usePresupuesto } from '../hooks/usePresupuesto';
import { useProveedores } from '../hooks/useProveedores';
import { useUIStore } from '@shared/store/ui.store';

export const EgresoNew = () => {
  const navigate = useNavigate();
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const { mutateAsync, isPending } = useCreateEgreso();
  const { data: cuentas } = useCuentas();
  const { data: presupuesto } = usePresupuesto();
  const { data: proveedores } = useProveedores();

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Egresos', 'Nuevo egreso']);
  }, [setBreadcrumb]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar nuevo egreso</CardTitle>
      </CardHeader>
      <CardContent>
        <EgresoForm
          proveedores={proveedores ?? []}
          cuentas={cuentas ?? []}
          partidas={presupuesto?.partidas ?? []}
          loading={isPending}
          onSubmit={async (values) => {
            await mutateAsync(values);
            navigate('/tesoreria/egresos');
          }}
        />
      </CardContent>
    </Card>
  );
};
