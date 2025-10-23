import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { Textarea } from '@shared/components/ui/textarea';
import { Uploader } from '@shared/components/Uploader';
import { validateNonFutureDate, validatePositiveAmount, validatePartida, validateCapituloPartida } from '@shared/lib/validators';
import type { CuentaBancaria, Ingreso, Partida } from '@treasury/types';

export interface IngresoFormProps {
  defaultValues?: Partial<Ingreso>;
  cuentas: CuentaBancaria[];
  partidas: Partida[];
  onSubmit: (values: Partial<Ingreso> & { adjuntos?: string[] }) => Promise<void> | void;
  loading?: boolean;
}

export const IngresoForm = ({ defaultValues, cuentas, partidas, onSubmit, loading }: IngresoFormProps) => {
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors }
  } = useForm<Partial<Ingreso>>({
    defaultValues: {
      fecha: defaultValues?.fecha ?? new Date().toISOString().slice(0, 10),
      concepto: defaultValues?.concepto ?? '',
      importe: defaultValues?.importe ?? 0,
      fuente: defaultValues?.fuente ?? '',
      referencia: defaultValues?.referencia ?? '',
      cuentaId: defaultValues?.cuentaId ?? cuentas[0]?.id,
      capitulo: defaultValues?.capitulo ?? '',
      partida: defaultValues?.partida ?? ''
    }
  });

  const [adjuntos, setAdjuntos] = useState<string[]>(defaultValues?.bitacora?.map((item) => item.action) ?? []);

  const selectedCapitulo = watch('capitulo');

  const submit = handleSubmit(async (values) => {
    const fechaValid = validateNonFutureDate(values.fecha ?? '');
    const importeValid = validatePositiveAmount(Number(values.importe));
    const partidaValid = validatePartida(values.partida ?? '');
    const capituloValid = validateCapituloPartida(values.capitulo ?? '', values.partida ?? '');

    const validations = [fechaValid, importeValid, partidaValid, capituloValid];
    const errorsList = validations.filter((item) => item !== true);
    if (errorsList.length) {
      throw new Error(Array.isArray(errorsList) ? errorsList.join('\n') : String(errorsList));
    }
    await onSubmit({ ...values, adjuntos });
  });

  return (
    <form onSubmit={submit} className="grid gap-4" aria-label="Formulario de ingreso">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha de ingreso</Label>
          <Input type="date" id="fecha" {...register('fecha', { required: true })} />
          {errors.fecha ? <p className="text-xs text-red-600">Ingrese una fecha válida.</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="importe">Importe</Label>
          <Input type="number" step="0.01" id="importe" {...register('importe', { valueAsNumber: true })} />
          {errors.importe ? <p className="text-xs text-red-600">El importe es obligatorio.</p> : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="concepto">Concepto</Label>
        <Textarea id="concepto" rows={2} {...register('concepto', { required: true })} />
        {errors.concepto ? <p className="text-xs text-red-600">Capture el concepto del ingreso.</p> : null}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Fuente de recurso</Label>
          <Input placeholder="Ej. Predial" {...register('fuente', { required: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="referencia">Referencia</Label>
          <Input id="referencia" placeholder="Referencia bancaria" {...register('referencia')} />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Cuenta bancaria</Label>
          <Select onValueChange={(value) => setValue('cuentaId', value)} value={watch('cuentaId')}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione una cuenta" />
            </SelectTrigger>
            <SelectContent>
              {cuentas.map((cuenta) => (
                <SelectItem key={cuenta.id} value={cuenta.id}>
                  {cuenta.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Capítulo</Label>
          <Select onValueChange={(value) => setValue('capitulo', value)} value={watch('capitulo')}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione el capítulo" />
            </SelectTrigger>
            <SelectContent>
              {[...new Set(partidas.map((partida) => partida.capitulo))].map((capitulo) => (
                <SelectItem key={capitulo} value={capitulo}>
                  {capitulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Partida</Label>
          <Select onValueChange={(value) => setValue('partida', value)} value={watch('partida')}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione partida" />
            </SelectTrigger>
            <SelectContent>
              {partidas
                .filter((partida) => !selectedCapitulo || partida.capitulo === selectedCapitulo)
                .map((partida) => (
                  <SelectItem key={partida.clave} value={partida.clave}>
                    {partida.clave} · {partida.nombre}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Adjuntos</Label>
          <Uploader
            accept=".xml,.pdf,.jpg,.png"
            onFiles={(files) => setAdjuntos((prev) => [...prev, ...files.map((file) => file.name)])}
            files={adjuntos.map((file) => ({ name: file, size: 1024 }))}
            onRemove={(fileName) => setAdjuntos((prev) => prev.filter((name) => name !== fileName))}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar ingreso'}
        </Button>
      </div>
    </form>
  );
};
