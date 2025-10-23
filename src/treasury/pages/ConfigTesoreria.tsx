import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Switch } from '@shared/components/ui/switch';
import { useUIStore } from '@shared/store/ui.store';
import { useAuthStore } from '@auth/auth.store';
import { toast } from '@shared/hooks/useToast';

export const ConfigTesoreriaPage = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const user = useAuthStore((state) => state.user);
  const [uuidObligatorio, setUuidObligatorio] = useState(true);
  const [moneda, setMoneda] = useState('MXN');
  const [formatoFecha, setFormatoFecha] = useState('DD/MM/YYYY');

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Configuración de Tesorería']);
  }, [setBreadcrumb]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Parámetros de validación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">UUID obligatorio</p>
              <p className="text-xs text-muted-foreground">Exigir UUID en egresos y compromisos.</p>
            </div>
            <Switch checked={uuidObligatorio} onCheckedChange={(value) => setUuidObligatorio(Boolean(value))} />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Formato de fecha</p>
              <Input value={formatoFecha} onChange={(event) => setFormatoFecha(event.target.value)} />
            </div>
            <div>
              <p className="text-sm font-medium">Moneda oficial</p>
              <Input value={moneda} onChange={(event) => setMoneda(event.target.value)} />
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => toast({ title: 'Configuración guardada', description: 'Las reglas se aplicarán en próximos registros.' })}
          >
            Guardar cambios
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Usuarios autorizados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Usuario activo:</p>
          <div className="rounded border border-border p-3 text-sm">
            <p className="font-semibold">{user?.nombre}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <p className="text-xs">Rol: {user?.rol}</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Solo el TESORERO está habilitado en este módulo.</p>
        </CardContent>
      </Card>
    </div>
  );
};
