import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { IngresoForm } from '../components/IngresoForm';
import { useCreateIngreso } from '../hooks/useIngresos';
import { useCuentas } from '../hooks/useBancos';
import { usePresupuesto } from '../hooks/usePresupuesto';
import { useUIStore } from '@shared/store/ui.store';

export const IngresoNew = () => {
  const navigate = useNavigate();
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const { mutateAsync, isPending } = useCreateIngreso();
  const { data: cuentas } = useCuentas();
  const { data: presupuesto } = usePresupuesto();

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Ingresos', 'Nuevo ingreso']);
  }, [setBreadcrumb]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar nuevo ingreso</CardTitle>
      </CardHeader>
      <CardContent>
        <IngresoForm
          cuentas={cuentas ?? []}
          partidas={presupuesto?.partidas ?? []}
          loading={isPending}
          onSubmit={async (values) => {
            await mutateAsync(values);
            navigate('/tesoreria/ingresos');
          }}
        />
      </CardContent>
    </Card>
  );
};
