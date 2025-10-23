import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@shared/lib/api';
import type { CuentaBancaria, MovimientoBancario } from '@treasury/types';
import { toast } from '@shared/hooks/useToast';

export const useCuentas = () =>
  useQuery({
    queryKey: ['cuentas'],
    queryFn: async () => {
      const { data } = await api.get<CuentaBancaria[]>('/bancos');
      return data;
    }
  });

export const useMovimientos = (filters?: { cuentaId?: string; conciliado?: string }) =>
  useQuery({
    queryKey: ['movimientos', filters],
    queryFn: async () => {
      const { data } = await api.get<MovimientoBancario[]>('/movimientos', { params: filters });
      return data;
    }
  });

export const useGuardarCuenta = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<CuentaBancaria> & { id?: string }) => {
      if (payload.id) {
        const { data } = await api.put<CuentaBancaria>(`/bancos/${payload.id}`, payload);
        return data;
      }
      const { data } = await api.post<CuentaBancaria>('/bancos', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuentas'] });
      toast({ title: 'Cuenta bancaria guardada', variant: 'success' });
    }
  });
};

export const useGuardarMovimiento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<MovimientoBancario> & { id?: string }) => {
      if (payload.id) {
        const { data } = await api.put<MovimientoBancario>(`/movimientos/${payload.id}`, payload);
        return data;
      }
      const { data } = await api.post<MovimientoBancario>('/movimientos', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      toast({ title: 'Movimiento registrado', variant: 'success' });
    }
  });
};

export const useImportarMovimientos = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lista: MovimientoBancario[]) => {
      const { data } = await api.post<MovimientoBancario[]>('/movimientos/import', lista);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      toast({ title: 'Movimientos importados', variant: 'success' });
    }
  });
};

export const useConciliarMovimientos = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, conciliado }: { ids: string[]; conciliado: boolean }) => {
      const { data } = await api.post('/conciliacion/match', { ids, conciliado });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      toast({ title: 'Conciliación actualizada' });
    }
  });
};
