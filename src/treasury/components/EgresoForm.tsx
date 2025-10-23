import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { Textarea } from '@shared/components/ui/textarea';
import { Uploader } from '@shared/components/Uploader';
import { validateNonFutureDate, validatePositiveAmount, validatePartida, validateCapituloPartida, validateUUID } from '@shared/lib/validators';
import type { CuentaBancaria, Egreso, Partida, Proveedor } from '@treasury/types';

interface EgresoFormProps {
  defaultValues?: Partial<Egreso>;
  proveedores: Proveedor[];
  cuentas: CuentaBancaria[];
  partidas: Partida[];
  onSubmit: (values: Partial<Egreso> & { adjuntos?: string[] }) => Promise<void> | void;
  loading?: boolean;
}

export const EgresoForm = ({ defaultValues, proveedores, cuentas, partidas, onSubmit, loading }: EgresoFormProps) => {
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors }
  } = useForm<Partial<Egreso>>({
    defaultValues: {
      fecha: defaultValues?.fecha ?? new Date().toISOString().slice(0, 10),
      concepto: defaultValues?.concepto ?? '',
      importe: defaultValues?.importe ?? 0,
      proveedorId: defaultValues?.proveedorId ?? proveedores[0]?.id,
      cuentaId: defaultValues?.cuentaId ?? cuentas[0]?.id,
      capitulo: defaultValues?.capitulo ?? '',
      partida: defaultValues?.partida ?? '',
      estatus: defaultValues?.estatus ?? 'PENDIENTE'
    }
  });

  const [adjuntos, setAdjuntos] = useState<string[]>([]);
  const selectedCapitulo = watch('capitulo');
  const providerQuery = watch('proveedorId');

  const proveedorActual = useMemo(() => proveedores.find((prov) => prov.id === providerQuery), [proveedores, providerQuery]);

  const submit = handleSubmit(async (values) => {
    const importeValid = validatePositiveAmount(Number(values.importe));
    const uuidValid = validateUUID(values.uuid);
    const partidaValid = validatePartida(values.partida ?? '');
    const capituloValid = validateCapituloPartida(values.capitulo ?? '', values.partida ?? '');
    const fechaValid = validateNonFutureDate(values.fecha ?? '');
    const validations = [importeValid, uuidValid, partidaValid, capituloValid, fechaValid];
    const errorsList = validations.filter((v) => v !== true);
    if (errorsList.length) {
      throw new Error(errorsList.join('\n'));
    }
    await onSubmit({ ...values, adjuntos });
  });

  return (
    <form onSubmit={submit} className="grid gap-4" aria-label="Formulario de egreso">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha del egreso</Label>
          <Input type="date" id="fecha" {...register('fecha', { required: true })} />
          {errors.fecha ? <p className="text-xs text-red-600">Seleccione una fecha válida.</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="importe">Importe</Label>
          <Input type="number" step="0.01" id="importe" {...register('importe', { valueAsNumber: true })} />
          {errors.importe ? <p className="text-xs text-red-600">Capture un importe válido.</p> : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Proveedor</Label>
        <Select onValueChange={(value) => setValue('proveedorId', value)} value={watch('proveedorId')}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione el proveedor" />
          </SelectTrigger>
          <SelectContent>
            {proveedores.map((proveedor) => (
              <SelectItem key={proveedor.id} value={proveedor.id}>
                {proveedor.nombre} ({proveedor.rfc})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {proveedorActual ? (
          <p className="text-xs text-muted-foreground">RFC: {proveedorActual.rfc} · {proveedorActual.email}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="concepto">Concepto del egreso</Label>
        <Textarea id="concepto" rows={3} {...register('concepto', { required: true })} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <Label>UUID (opcional)</Label>
          <Input placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" {...register('uuid')} />
        </div>
        <div className="space-y-2">
          <Label>Cuenta bancaria</Label>
          <Select onValueChange={(value) => setValue('cuentaId', value)} value={watch('cuentaId')}>
            <SelectTrigger>
              <SelectValue placeholder="Cuenta" />
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
          <Label>Estatus</Label>
          <Select onValueChange={(value) => setValue('estatus', value as Egreso['estatus'])} value={watch('estatus')}>
            <SelectTrigger>
              <SelectValue placeholder="Estatus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDIENTE">Pendiente</SelectItem>
              <SelectItem value="PAGADO">Pagado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Capítulo</Label>
          <Select onValueChange={(value) => setValue('capitulo', value)} value={watch('capitulo')}>
            <SelectTrigger>
              <SelectValue placeholder="Capítulo" />
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
        <div className="space-y-2">
          <Label>Partida</Label>
          <Select onValueChange={(value) => setValue('partida', value)} value={watch('partida')}>
            <SelectTrigger>
              <SelectValue placeholder="Partida" />
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
      </div>
      <div className="space-y-2">
        <Label>Adjuntos (XML/PDF)</Label>
        <Uploader
          accept=".xml,.pdf"
          onFiles={(files) => setAdjuntos((prev) => [...prev, ...files.map((file) => file.name)])}
          files={adjuntos.map((file) => ({ name: file, size: 1024 }))}
          onRemove={(fileName) => setAdjuntos((prev) => prev.filter((name) => name !== fileName))}
        />
      </div>
      <div className="space-y-2">
        <Label>Referencia de pago (opcional)</Label>
        <Input placeholder="Número de transferencia" {...register('refPago')} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar egreso'}
        </Button>
      </div>
    </form>
  );
};
