import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { CompromisoWizard } from '../components/CompromisoWizard';
import { useCreateCompromiso } from '../hooks/useCompromisos';
import { useProveedores } from '../hooks/useProveedores';
import { usePresupuesto } from '../hooks/usePresupuesto';
import { useCuentas } from '../hooks/useBancos';
import { useUIStore } from '@shared/store/ui.store';

export const CompromisoNew = () => {
  const navigate = useNavigate();
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const { data: proveedores } = useProveedores();
  const { data: presupuesto } = usePresupuesto();
  const { data: cuentas } = useCuentas();
  const { mutateAsync, isPending } = useCreateCompromiso();

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Compromisos de Pago', 'Nuevo compromiso']);
  }, [setBreadcrumb]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generar compromiso</CardTitle>
      </CardHeader>
      <CardContent>
        <CompromisoWizard
          proveedores={proveedores ?? []}
          partidas={presupuesto?.partidas ?? []}
          cuentas={cuentas ?? []}
          onSubmit={async (values) => {
            await mutateAsync(values);
            navigate('/tesoreria/compromisos');
          }}
        />
        {isPending ? <p className="mt-3 text-xs text-muted-foreground">Guardando compromiso…</p> : null}
      </CardContent>
    </Card>
  );
};
