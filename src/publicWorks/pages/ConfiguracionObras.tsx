import { useEffect, useState } from 'react';
import { useUIStore } from '@shared/store/ui.store';
import { useConfiguracionObras, useActualizarConfiguracion } from '@publicWorks/hooks/useConfiguracionObras';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';
import { Switch } from '@shared/components/ui/switch';
import { toast } from '@shared/hooks/useToast';

export const ConfiguracionObras = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const { data: configuracion } = useConfiguracionObras();
  const { mutateAsync, isPending } = useActualizarConfiguracion();
  const [umbralRetraso, setUmbralRetraso] = useState(10);
  const [umbralDesviacion, setUmbralDesviacion] = useState(5);
  const [prefijoNumeracion, setPrefijoNumeracion] = useState('ACT-2024');
  const [leerTesoreria, setLeerTesoreria] = useState(true);
  const [enviarPrefolios, setEnviarPrefolios] = useState(true);

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Configuración']);
  }, [setBreadcrumb]);

  useEffect(() => {
    if (configuracion) {
      setUmbralRetraso(configuracion.reglas.umbralRetrasoDias);
      setUmbralDesviacion(configuracion.reglas.umbralDesviacion);
      setPrefijoNumeracion(configuracion.reglas.formatoNumeracion);
      setLeerTesoreria(configuracion.integraciones.tesoreria.compromisosLectura);
      setEnviarPrefolios(configuracion.integraciones.tesoreria.preFoliosEnvio);
    }
  }, [configuracion]);

  if (!configuracion) {
    return <p className="text-sm text-muted-foreground">Cargando configuración…</p>;
  }

  const guardar = async () => {
    await mutateAsync({
      ...configuracion,
      reglas: {
        umbralRetrasoDias: umbralRetraso,
        umbralDesviacion,
        formatoNumeracion: prefijoNumeracion
      },
      integraciones: {
        tesoreria: {
          compromisosLectura: leerTesoreria,
          preFoliosEnvio: enviarPrefolios
        }
      }
    });
    toast({ title: 'Configuración guardada', description: 'Los cambios se aplicaron correctamente.', variant: 'success' });
  };

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Configuración del módulo</h1>
        <p className="text-sm text-muted-foreground">Administra catálogos, umbrales de alerta e integraciones con Tesorería.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Catálogos disponibles</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div>
              <h3 className="font-semibold text-foreground">Fuentes de financiamiento</h3>
              <p className="text-xs text-muted-foreground">{configuracion.fuentes.join(', ')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Localidades</h3>
              <p className="text-xs text-muted-foreground">{configuracion.localidades.join(', ')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Contratistas</h3>
              <ul className="list-disc pl-4 text-xs text-muted-foreground">
                {configuracion.contratistas.map((contratista) => (
                  <li key={contratista.id}>{contratista.nombre}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reglas de alertas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-muted-foreground">Umbral de retraso (días)</label>
              <Input type="number" min={0} value={umbralRetraso} onChange={(event) => setUmbralRetraso(Number(event.target.value))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Desviación financiera permitida (%)</label>
              <Input type="number" step="0.1" value={umbralDesviacion} onChange={(event) => setUmbralDesviacion(Number(event.target.value))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Formato de numeración para actas</label>
              <Input value={prefijoNumeracion} onChange={(event) => setPrefijoNumeracion(event.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integración con Tesorería</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Lectura de compromisos y pagos</p>
                <p className="text-xs text-muted-foreground">Consulta información generada desde Tesorería.</p>
              </div>
              <Switch checked={leerTesoreria} onCheckedChange={setLeerTesoreria} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Envío de pre-folios</p>
                <p className="text-xs text-muted-foreground">Comparte estimaciones aprobadas con Tesorería.</p>
              </div>
              <Switch checked={enviarPrefolios} onCheckedChange={setEnviarPrefolios} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={guardar} disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </section>
  );
};

