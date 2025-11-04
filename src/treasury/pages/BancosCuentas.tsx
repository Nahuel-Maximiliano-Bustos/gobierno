import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { useCuentas, useGuardarCuenta } from '../hooks/useBancos';
import { formatCurrency } from '@shared/lib/utils';
import { useUIStore } from '@shared/store/ui.store';
import type { CuentaBancaria } from '@treasury/types';
import { toast } from '@shared/hooks/useToast';

export const BancosCuentasPage = () => {
  const { data, isLoading, refetch } = useCuentas();
  const guardarCuenta = useGuardarCuenta();
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const [form, setForm] = useState<Partial<CuentaBancaria>>({ nombre: '', banco: '', clabe: '', saldo: 0, moneda: 'MXN' });

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Bancos y Cuentas']);
  }, [setBreadcrumb]);

  const handleSubmit = async () => {
    if (!form.nombre || !form.banco || !form.clabe) {
      toast({ title: 'Complete la información obligatoria', variant: 'warning' });
      return;
    }
    await guardarCuenta.mutateAsync(form as CuentaBancaria);
    setForm({ nombre: '', banco: '', clabe: '', saldo: 0, moneda: 'MXN' });
    refetch();
  };

  return (
    <div className="space-y-4 bg-[#E0E0E0] [&_*]:bg-inherit">
      <Card className="!bg-white border-0">
        <CardHeader className="!bg-transparent">
          <CardTitle>Registrar cuenta bancaria</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5 !bg-transparent">
          <Input 
            placeholder="Banco" 
            value={form.banco ?? ''} 
            onChange={(event) => setForm((prev) => ({ ...prev, banco: event.target.value }))} 
            className="!bg-[#CACACA] placeholder:text-[#1F2937]"
          />
          <Input 
            placeholder="Nombre" 
            value={form.nombre ?? ''} 
            onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))} 
            className="!bg-[#CACACA] placeholder:text-[#1F2937]"
          />
          <Input 
            placeholder="CLABE" 
            value={form.clabe ?? ''} 
            onChange={(event) => setForm((prev) => ({ ...prev, clabe: event.target.value }))} 
            className="!bg-[#CACACA] placeholder:text-[#1F2937]"
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Saldo inicial"
            value={form.saldo ?? 0}
            onChange={(event) => setForm((prev) => ({ ...prev, saldo: Number(event.target.value) }))}
            className="!bg-[#CACACA] placeholder:text-[#1F2937]"
          />
          <Button 
            onClick={handleSubmit} 
            disabled={guardarCuenta.isPending}
            className="!bg-[#0E1024] hover:!bg-[#1a1d3a] active:!bg-[#060812] !border !border-[#1a1d3a] !text-white"
          >
            Guardar
          </Button>
        </CardContent>
      </Card>

      <Card className="!bg-transparent border-0">
        <CardHeader className="!bg-transparent">
          <CardTitle>Cuentas activas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 !bg-transparent">
          {isLoading ? <p className="text-sm text-muted-foreground">Cargando cuentas…</p> : null}
          <ul className="grid gap-3 md:grid-cols-2">
            {data?.map((cuenta) => (
              <li key={cuenta.id} className="rounded-lg border border-border p-4 !bg-white">
                <p className="text-sm font-semibold">{cuenta.nombre}</p>
                <p className="text-xs text-muted-foreground">{cuenta.banco} · {cuenta.clabe}</p>
                <p className="text-sm">Saldo: {formatCurrency(cuenta.saldo)}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 !bg-[#0E1024] hover:!bg-[#1a1d3a] active:!bg-[#060812] !border !border-[#1a1d3a] !text-white"
                  onClick={() => setForm(cuenta)}
                >
                  Editar
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};