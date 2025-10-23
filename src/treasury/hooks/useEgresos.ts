import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@shared/lib/api';
import type { Egreso } from '@treasury/types';
import { toast } from '@shared/hooks/useToast';
import { downloadFile } from '@shared/lib/utils';

export interface EgresosFilters {
  q?: string;
  proveedorId?: string;
  estatus?: 'PENDIENTE' | 'PAGADO';
  fechaInicio?: string;
  fechaFin?: string;
}

export const useEgresos = (filters?: EgresosFilters) =>
  useQuery({
    queryKey: ['egresos', filters],
    queryFn: async () => {
      const { data } = await api.get<Egreso[]>('/egresos', { params: filters });
      return data;
    }
  });

export const useEgreso = (id?: string) =>
  useQuery({
    queryKey: ['egreso', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<Egreso>(`/egresos/${id}`);
      return data;
    },
    enabled: Boolean(id)
  });

export const useCreateEgreso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Egreso>) => {
      const { data } = await api.post<Egreso>('/egresos', payload);
      return data;
    },
    onSuccess: (egreso) => {
      queryClient.invalidateQueries({ queryKey: ['egresos'] });
      toast({ title: 'Egreso registrado', description: egreso.concepto, variant: 'success' });
    }
  });
};

export const useUpdateEgreso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Egreso> }) => {
      const { data } = await api.put<Egreso>(`/egresos/${id}`, payload);
      return data;
    },
    onSuccess: (egreso) => {
      queryClient.invalidateQueries({ queryKey: ['egresos'] });
      queryClient.invalidateQueries({ queryKey: ['egreso', egreso.id] });
      toast({ title: 'Egreso actualizado', description: egreso.concepto });
    }
  });
};

export const useDeleteEgreso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/egresos/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['egresos'] });
      toast({ title: 'Egreso eliminado', variant: 'warning' });
    }
  });
};

export const exportEgresosCSV = (egresos: Egreso[]) => {
  const header = 'fecha,concepto,proveedor,importe,cuenta,partida,capitulo,estatus';
  const rows = egresos.map((eg) =>
    [eg.fecha, eg.concepto, eg.proveedorId, eg.importe.toFixed(2), eg.cuentaId, eg.partida, eg.capitulo, eg.estatus]
      .map((value) => `"${value}"`)
      .join(',')
  );
  downloadFile(`egresos-${new Date().toISOString()}.csv`, [header, ...rows].join('\n'));
};
