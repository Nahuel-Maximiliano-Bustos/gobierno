import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@shared/store/ui.store';
import { Wizard, type WizardStep } from '@shared/components/Wizard';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { Textarea } from '@shared/components/ui/textarea';
import { Button } from '@shared/components/ui/button';
import { useConfiguracionObras } from '@publicWorks/hooks/useConfiguracionObras';
import { useCrearPrograma } from '@publicWorks/hooks/useProgramacionAnual';
import type { ProgramaAnualItem } from '@publicWorks/types';
import { toast } from '@shared/hooks/useToast';

type ProgramaFormValues = Omit<ProgramaAnualItem, 'id' | 'auditoria'>;

const initialValues: ProgramaFormValues = {
  ejercicio: new Date().getFullYear(),
  programa: '',
  fuente: 'FAISMUN',
  rubro: '',
  localidad: '',
  montoProgramado: 0,
  beneficiarios: 0,
  metaFisica: '',
  estatus: 'Planeado'
};

export const ProgramacionAnualForm = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const { data: configuracion } = useConfiguracionObras();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCrearPrograma();
  const [values, setValues] = useState<ProgramaFormValues>(initialValues);

  useEffect(() => {
    setBreadcrumb(['Obras Públicas', 'Programación Anual', 'Nuevo']);
  }, [setBreadcrumb]);

  const steps: WizardStep<ProgramaFormValues>[] = [
    {
      id: 'generales',
      title: 'Datos generales',
      description: 'Define ejercicio, programa y ubicaciones',
      content: ({ ejercicio, fuente, rubro, localidad, programa, onChange }) => (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ejercicio">Ejercicio fiscal</Label>
            <Select
              value={String(ejercicio)}
              onValueChange={(value) => onChange({ ejercicio: Number(value) })}
            >
              <SelectTrigger id="ejercicio">
                <SelectValue placeholder="Seleccione el ejercicio" />
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
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="programa">Nombre del programa</Label>
            <Input
              id="programa"
              placeholder="Ej. Infraestructura urbana sostenible"
              value={programa}
              onChange={(event) => onChange({ programa: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Fuente de financiamiento</Label>
            <Select value={fuente} onValueChange={(value) => onChange({ fuente: value as ProgramaFormValues['fuente'] })}>
              <SelectTrigger>
                <SelectValue placeholder="Fuente" />
              </SelectTrigger>
              <SelectContent>
                {(configuracion?.fuentes ?? []).map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Rubro</Label>
            <Select value={rubro} onValueChange={(value) => onChange({ rubro: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione rubro" />
              </SelectTrigger>
              <SelectContent>
                {(configuracion?.rubros ?? []).map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Localidad</Label>
            <Select value={localidad} onValueChange={(value) => onChange({ localidad: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione localidad" />
              </SelectTrigger>
              <SelectContent>
                {(configuracion?.localidades ?? []).map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
      validator: (current) => {
        if (!current.programa.trim()) return 'Capture el nombre del programa.';
        if (!current.rubro) return 'Seleccione el rubro del programa.';
        if (!current.localidad) return 'Debe elegir al menos una localidad.';
        return true;
      }
    },
    {
      id: 'metas',
      title: 'Metas y beneficiarios',
      description: 'Cuantifica los impactos del programa',
      content: ({ beneficiarios, metaFisica, onChange }) => (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="beneficiarios">Personas beneficiadas</Label>
            <Input
              id="beneficiarios"
              type="number"
              min={0}
              value={beneficiarios}
              onChange={(event) => onChange({ beneficiarios: Number(event.target.value) })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="metaFisica">Meta física</Label>
            <Textarea
              id="metaFisica"
              rows={3}
              placeholder="Ej. Rehabilitar 4.2 km de pavimento hidráulico y modernizar luminarias."
              value={metaFisica}
              onChange={(event) => onChange({ metaFisica: event.target.value })}
            />
          </div>
        </div>
      ),
      validator: (current) => {
        if (!current.metaFisica.trim()) return 'La meta física es obligatoria.';
        if (!current.beneficiarios || current.beneficiarios <= 0) return 'Indique el número de beneficiarios estimados.';
        return true;
      }
    },
    {
      id: 'presupuesto',
      title: 'Presupuesto y estatus',
      description: 'Registra el monto programado y su estado',
      content: ({ montoProgramado, estatus, onChange }) => (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="montoProgramado">Monto programado</Label>
            <Input
              id="montoProgramado"
              type="number"
              min={0}
              step="0.01"
              value={montoProgramado}
              onChange={(event) => onChange({ montoProgramado: Number(event.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              Los montos deben coincidir con las fuentes registradas y nunca exceder el techo autorizado.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Estatus del programa</Label>
            <Select value={estatus} onValueChange={(value) => onChange({ estatus: value as ProgramaFormValues['estatus'] })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planeado">Planeado</SelectItem>
                <SelectItem value="En revisión">En revisión</SelectItem>
                <SelectItem value="Publicado">Publicado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
      validator: (current) => {
        if (!current.montoProgramado || current.montoProgramado <= 0) return 'Define el monto programado del proyecto.';
        return true;
      }
    }
  ];

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Registrar programa anual</h1>
          <p className="text-sm text-muted-foreground">
            Completa la información del POA en tres pasos. Todos los campos se validan antes de continuar.
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/obras/poa')}>
          Cancelar
        </Button>
      </header>

      <Wizard
        steps={steps}
        initialValues={values}
        autosave={(next) => setValues(next)}
        onFinish={async (payload) => {
          await mutateAsync(payload);
          toast({ title: 'Programa registrado', description: 'Se agregó al POA de Obras Públicas.' });
          navigate('/obras/poa');
        }}
      />

      {isPending ? <p className="text-xs text-muted-foreground">Guardando programa…</p> : null}
    </section>
  );
};
