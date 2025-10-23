import { useState } from 'react';
import { Wizard, type WizardStep } from '@shared/components/Wizard';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Textarea } from '@shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { Uploader } from '@shared/components/Uploader';
import type { Compromiso, CuentaBancaria, Partida, Proveedor } from '@treasury/types';
import { BudgetAffectation } from './BudgetAffectation';
import { validateCapituloPartida, validatePartida, validatePositiveAmount, validateRFC, validateUUID } from '@shared/lib/validators';

export interface CompromisoWizardProps {
  proveedores: Proveedor[];
  partidas: Array<Partida & { comprometido?: number; devengado?: number; pagado?: number }>;
  cuentas: CuentaBancaria[];
  onSubmit: (values: Compromiso) => Promise<void> | void;
}

type CompromisoDraft = {
  proveedor: Proveedor;
  uuid: string;
  concepto: string;
  importe: number;
  partida: string;
  capitulo: string;
  fechaDocumento: string;
  fechaProgramada: string;
  estatus: Compromiso['estatus'];
  banco?: string;
  refPago?: string;
  adjuntos: Array<{ id: string; name: string }>; 
  bitacora: Compromiso['bitacora'];
};

const defaultProveedor: Proveedor = {
  id: '',
  nombre: '',
  rfc: ''
};

export const CompromisoWizard = ({ proveedores, partidas, cuentas, onSubmit }: CompromisoWizardProps) => {
  const [adjuntos, setAdjuntos] = useState<Array<{ id: string; name: string }>>([]);

  const steps: WizardStep<CompromisoDraft>[] = [
    {
      id: 'proveedor',
      title: 'Proveedor',
      description: 'Selecciona un proveedor o da de alta uno nuevo',
      validator: (values) => {
        if (!values.proveedor?.id && !values.proveedor?.nombre) return 'Debe seleccionar o capturar un proveedor.';
        const rfcValid = validateRFC(values.proveedor?.rfc ?? '');
        return rfcValid === true ? true : rfcValid;
      },
      content: ({ proveedor, onChange }) => {
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Proveedor registrado</Label>
              <Select
                value={proveedor?.id ?? ''}
                onValueChange={(value) => {
                  if (!value) return;
                  const encontrado = proveedores.find((item) => item.id === value);
                  if (encontrado) onChange({ proveedor: encontrado });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {proveedores.map((prov) => (
                    <SelectItem key={prov.id} value={prov.id}>
                      {prov.nombre} ({prov.rfc})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Alta rápida</Label>
              <Input
                placeholder="Nombre comercial"
                value={proveedor?.nombre ?? ''}
                onChange={(event) =>
                  onChange({ proveedor: { ...(proveedor ?? defaultProveedor), nombre: event.target.value } })
                }
              />
              <Input
                placeholder="RFC"
                value={proveedor?.rfc ?? ''}
                onChange={(event) =>
                  onChange({ proveedor: { ...(proveedor ?? defaultProveedor), rfc: event.target.value.toUpperCase() } })
                }
              />
              <Input
                placeholder="Correo de contacto"
                value={proveedor?.email ?? ''}
                onChange={(event) =>
                  onChange({ proveedor: { ...(proveedor ?? defaultProveedor), email: event.target.value } })
                }
              />
            </div>
          </div>
        );
      }
    },
    {
      id: 'documento',
      title: 'Documento',
      description: 'Datos fiscales del compromiso',
      validator: (values) => {
        const uuidValid = validateUUID(values.uuid);
        const importeValid = validatePositiveAmount(values.importe);
        if (uuidValid !== true) return uuidValid;
        if (importeValid !== true) return importeValid;
        if (!values.fechaDocumento) return 'Capture la fecha del documento respaldatorio.';
        if (!values.adjuntos?.length) return 'Adjunte al menos un archivo del comprobante.';
        return true;
      },
      content: ({ uuid, concepto, importe, fechaDocumento, adjuntos: wizardAdjuntos, onChange }) => (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>UUID</Label>
            <Input value={uuid ?? ''} onChange={(event) => onChange({ uuid: event.target.value })} placeholder="UUID del CFDI" />
          </div>
          <div className="space-y-2">
            <Label>Importe</Label>
            <Input
              type="number"
              step="0.01"
              value={importe ?? 0}
              onChange={(event) => onChange({ importe: Number(event.target.value) })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Concepto</Label>
            <Textarea
              rows={3}
              value={concepto ?? ''}
              onChange={(event) => onChange({ concepto: event.target.value })}
              placeholder="Describe el servicio o producto comprometido"
            />
          </div>
          <div className="space-y-2">
            <Label>Fecha del documento</Label>
            <Input
              type="date"
              value={fechaDocumento ?? ''}
              onChange={(event) => onChange({ fechaDocumento: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Adjuntos</Label>
            <Uploader
              accept=".xml,.pdf"
              onFiles={(files) => {
                const next = [...(wizardAdjuntos ?? []), ...files.map((file) => ({ id: crypto.randomUUID(), name: file.name }))];
                setAdjuntos(next);
                onChange({ adjuntos: next });
              }}
              files={(wizardAdjuntos ?? []).map((file) => ({ name: file.name, size: 1024 }))}
              onRemove={(fileName) => {
                const next = (wizardAdjuntos ?? []).filter((file) => file.name !== fileName);
                setAdjuntos(next);
                onChange({ adjuntos: next });
              }}
            />
          </div>
        </div>
      )
    },
    {
      id: 'presupuesto',
      title: 'Presupuesto',
      description: 'Afectación presupuestal simulada',
      validator: (values) => {
        const partidaValid = validatePartida(values.partida ?? '');
        if (partidaValid !== true) return partidaValid;
        const capituloValid = validateCapituloPartida(values.capitulo ?? '', values.partida ?? '');
        if (capituloValid !== true) return capituloValid;
        return true;
      },
      content: ({ capitulo, partida, importe, onChange }) => {
        const partidaSeleccionada = partidas.find((item) => item.clave === partida);
        return (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Capítulo</Label>
                <Select value={capitulo ?? ''} onValueChange={(value) => onChange({ capitulo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...new Set(partidas.map((item) => item.capitulo))].map((cap) => (
                      <SelectItem key={cap} value={cap}>
                        {cap}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Partida</Label>
                <Select value={partida ?? ''} onValueChange={(value) => onChange({ partida: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione partida" />
                  </SelectTrigger>
                  <SelectContent>
                    {partidas
                      .filter((item) => !capitulo || item.capitulo === capitulo)
                      .map((item) => (
                        <SelectItem key={item.clave} value={item.clave}>
                          {item.clave} · {item.nombre}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <BudgetAffectation partida={partidaSeleccionada} importe={importe} />
          </div>
        );
      }
    },
    {
      id: 'programacion',
      title: 'Programación',
      description: 'Agenda de pago y cuenta fuente',
      validator: (values) => {
        if (!values.fechaProgramada) return 'Defina la fecha programada de pago.';
        if (!values.banco) return 'Indique el banco o cuenta de pago.';
        return true;
      },
      content: ({ fechaProgramada, banco, refPago, onChange }) => (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Fecha programada</Label>
            <Input
              type="date"
              value={fechaProgramada ?? ''}
              onChange={(event) => onChange({ fechaProgramada: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Banco / Cuenta</Label>
            <Select value={banco ?? ''} onValueChange={(value) => onChange({ banco: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione cuenta" />
              </SelectTrigger>
              <SelectContent>
                {cuentas.map((cuenta) => (
                  <SelectItem key={cuenta.id} value={`${cuenta.banco} · ${cuenta.nombre}`}>
                    {cuenta.banco} · {cuenta.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Referencia programada</Label>
            <Input value={refPago ?? ''} onChange={(event) => onChange({ refPago: event.target.value })} placeholder="Referencia o folio" />
          </div>
        </div>
      )
    }
  ];

  return (
    <Wizard
      steps={steps}
      initialValues={{
        proveedor: defaultProveedor,
        uuid: '',
        concepto: '',
        importe: 0,
        partida: '',
        capitulo: '',
        fechaDocumento: new Date().toISOString().slice(0, 10),
        fechaProgramada: new Date().toISOString().slice(0, 10),
        estatus: 'BORRADOR',
        banco: '',
        refPago: '',
        adjuntos: [],
        bitacora: []
      }}
      autosave={(values) => {
        if (values.adjuntos !== adjuntos) {
          setAdjuntos(values.adjuntos ?? []);
        }
      }}
      onFinish={async (values) => {
        await onSubmit({
          ...values,
          id: crypto.randomUUID(),
          adjuntos: values.adjuntos,
          bitacora: [
            {
              ts: new Date().toISOString(),
              user: 'TESORERO',
              action: 'Compromiso creado via asistente'
            }
          ]
        } as Compromiso);
      }}
    />
  );
};
