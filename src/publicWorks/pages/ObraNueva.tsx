import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@shared/store/ui.store';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Label } from '@shared/components/ui/label';
import { Input } from '@shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { Button } from '@shared/components/ui/button';
import { useConfiguracionObras } from '@publicWorks/hooks/useConfiguracionObras';
import { useCrearObra, type CrearObraPayload } from '@publicWorks/hooks/useObrasCatalogo';
import type { Obra } from '@publicWorks/types';
import { toast } from '@shared/hooks/useToast';
import dayjs from 'dayjs';

interface ObraFormValues {
  ejercicio: number;
  clave: string;
  nombre: string;
  localidad: string;
  fuente: string;
  rubro: string;
  modalidad: string;
  contratistaId: string;
  montoProgramado: number;
  montoContratado: number;
  montoModificado?: number;
  inicioProgramado: string;
  terminoProgramado: string;
  anticipo?: number;
}

export const ObraNueva = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const navigate = useNavigate();
  const { data: configuracion } = useConfiguracionObras();
  const { mutateAsync, isPending } = useCrearObra();

  const {
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ObraFormValues>({
    defaultValues: {
      ejercicio: new Date().getFullYear(),
      clave: '',
      nombre: '',
      localidad: '',
      fuente: 'FAISMUN',
      rubro: configuracion?.rubros[0] ?? '',
      modalidad: configuracion?.modalidades[0] ?? 'Licitación',
      contratistaId: configuracion?.contratistas[0]?.id ?? '',
      montoProgramado: 0,
      montoContratado: 0,
      montoModificado: undefined,
      inicioProgramado: dayjs().startOf('month').format('YYYY-MM-DD'),
      terminoProgramado: dayjs().add(4, 'month').endOf('month').format('YYYY-MM-DD'),
      anticipo: 0
    }
  });

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Catálogo de Obras', 'Nueva obra']);
  }, [setBreadcrumb]);

  const ejercicio = watch('ejercicio');
  const inicioProgramado = watch('inicioProgramado');
  const terminoProgramado = watch('terminoProgramado');
  const fuenteActual = watch('fuente');
  const rubroActual = watch('rubro');
  const localidadActual = watch('localidad');
  const modalidadActual = watch('modalidad');
  const contratistaActual = watch('contratistaId');

  useEffect(() => {
    if (!configuracion) return;
    if (!fuenteActual && configuracion.fuentes[0]) setValue('fuente', configuracion.fuentes[0]);
    if (!rubroActual && configuracion.rubros[0]) setValue('rubro', configuracion.rubros[0]);
    if (!localidadActual && configuracion.localidades[0]) setValue('localidad', configuracion.localidades[0]);
    if (!modalidadActual && configuracion.modalidades[0]) setValue('modalidad', configuracion.modalidades[0]);
    if (!contratistaActual && configuracion.contratistas[0]) setValue('contratistaId', configuracion.contratistas[0].id);
  }, [configuracion, fuenteActual, rubroActual, localidadActual, modalidadActual, contratistaActual, setValue]);

  const submit = handleSubmit(async (values) => {
    const inicio = dayjs(values.inicioProgramado);
    const termino = dayjs(values.terminoProgramado);
    if (!inicio.isValid() || !termino.isValid() || termino.isBefore(inicio)) {
      toast({ title: 'Fechas inválidas', description: 'Revise la programación de inicio y término.', variant: 'warning' });
      return;
    }
    if (inicio.year() !== ejercicio || termino.year() !== ejercicio) {
      toast({
        title: 'Fuera del ejercicio',
        description: 'Las fechas deben corresponder al ejercicio seleccionado. Registre prórroga en el detalle si aplica.',
        variant: 'warning'
      });
      return;
    }
    if (values.montoContratado <= 0) {
      toast({ title: 'Monto inválido', description: 'El monto contratado debe ser mayor a cero.', variant: 'warning' });
      return;
    }
    if (values.montoProgramado < values.montoContratado) {
      toast({ title: 'Validación de montos', description: 'El monto programado debe ser igual o mayor al contratado.', variant: 'warning' });
      return;
    }
    const obra: CrearObraPayload = {
      ejercicio: values.ejercicio,
      clave: values.clave,
      nombre: values.nombre,
      localidad: values.localidad,
      fuente: values.fuente as Obra['fuente'],
      rubro: values.rubro,
      modalidad: values.modalidad as Obra['modalidad'],
      contratistaId: values.contratistaId,
      montoProgramado: values.montoProgramado,
      montoContratado: values.montoContratado,
      montoModificado: values.montoModificado,
      fechas: {
        inicioProgramado: values.inicioProgramado,
        terminoProgramado: values.terminoProgramado
      },
      avance: {
        fisico: 0,
        financiero: 0,
        actualizadoEl: new Date().toISOString()
      },
      estatus: 'Programada'
    };

    await mutateAsync(obra);
    toast({ title: 'Obra registrada', description: 'Se agregó la obra al catálogo.', variant: 'success' });
    navigate('/obras/catalogo');
  });

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Registrar nueva obra</h1>
          <p className="text-sm text-muted-foreground">
            Captura los datos generales, programación y financiamiento inicial de la obra pública.
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/obras/catalogo')}>
          Cancelar
        </Button>
      </header>

      <form onSubmit={submit} className="grid gap-5" aria-label="Formulario de obra pública">
        <Card>
          <CardHeader>
            <CardTitle>Datos generales</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ejercicio">Ejercicio</Label>
              <Select value={String(ejercicio)} onValueChange={(value) => setValue('ejercicio', Number(value))}>
                <SelectTrigger id="ejercicio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clave">Clave de obra</Label>
              <Input id="clave" placeholder="OP-2024-001" {...register('clave', { required: true })} />
              {errors.clave ? <p className="text-xs text-red-600">Ingrese la clave de obra.</p> : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nombre">Nombre de la obra</Label>
              <Input id="nombre" placeholder="Construcción de pavimento hidráulico" {...register('nombre', { required: true })} />
              {errors.nombre ? <p className="text-xs text-red-600">Capture el nombre de la obra.</p> : null}
            </div>
            <div className="space-y-2">
              <Label>Localidad</Label>
              <Select value={watch('localidad')} onValueChange={(value) => setValue('localidad', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  {(configuracion?.localidades ?? []).map((localidad) => (
                    <SelectItem key={localidad} value={localidad}>
                      {localidad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fuente</Label>
              <Select value={watch('fuente')} onValueChange={(value) => setValue('fuente', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  {(configuracion?.fuentes ?? []).map((fuente) => (
                    <SelectItem key={fuente} value={fuente}>
                      {fuente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rubro</Label>
              <Select value={watch('rubro')} onValueChange={(value) => setValue('rubro', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  {(configuracion?.rubros ?? []).map((rubro) => (
                    <SelectItem key={rubro} value={rubro}>
                      {rubro}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Modalidad</Label>
              <Select value={watch('modalidad')} onValueChange={(value) => setValue('modalidad', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Modalidad" />
                </SelectTrigger>
                <SelectContent>
                  {(configuracion?.modalidades ?? []).map((modalidad) => (
                    <SelectItem key={modalidad} value={modalidad}>
                      {modalidad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contratista</Label>
              <Select value={watch('contratistaId')} onValueChange={(value) => setValue('contratistaId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Contratista" />
                </SelectTrigger>
                <SelectContent>
                  {(configuracion?.contratistas ?? []).map((contratista) => (
                    <SelectItem key={contratista.id} value={contratista.id}>
                      {contratista.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Programación</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inicioProgramado">Inicio programado</Label>
              <Input type="date" id="inicioProgramado" {...register('inicioProgramado', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terminoProgramado">Término programado</Label>
              <Input type="date" id="terminoProgramado" {...register('terminoProgramado', { required: true })} />
              {dayjs(terminoProgramado).isBefore(dayjs(inicioProgramado)) ? (
                <p className="text-xs text-red-600">La fecha de término debe ser posterior al inicio.</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="montoProgramado">Monto programado</Label>
              <Input type="number" step="0.01" id="montoProgramado" {...register('montoProgramado', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="montoContratado">Monto contratado</Label>
              <Input type="number" step="0.01" id="montoContratado" {...register('montoContratado', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="montoModificado">Monto modificado</Label>
              <Input type="number" step="0.01" id="montoModificado" {...register('montoModificado', { valueAsNumber: true })} />
              <p className="text-xs text-muted-foreground">Opcional: incluir modificatorio autorizado si existe.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="anticipo">Anticipo (%)</Label>
              <Input type="number" step="0.1" id="anticipo" {...register('anticipo', { valueAsNumber: true })} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/obras/catalogo')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Registrando…' : 'Registrar obra'}
          </Button>
        </div>
      </form>
    </section>
  );
};
