import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@shared/lib/api';
import type { Ingreso } from '@treasury/types';
import { toast } from '@shared/hooks/useToast';
import { downloadFile } from '@shared/lib/utils';

export interface IngresosFilters {
  q?: string;
  fechaInicio?: string;
  fechaFin?: string;
  fuente?: string;
  cuentaId?: string;
}

const queryKey = (filters?: IngresosFilters) => ['ingresos', filters] as const;

export const useIngresos = (filters?: IngresosFilters) =>
  useQuery({
    queryKey: queryKey(filters),
    queryFn: async () => {
      const { data } = await api.get<Ingreso[]>('/ingresos', { params: filters });
      return data;
    }
  });

export const useIngreso = (id?: string) =>
  useQuery({
    queryKey: ['ingreso', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<Ingreso>(`/ingresos/${id}`);
      return data;
    },
    enabled: Boolean(id)
  });

export const useCreateIngreso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Ingreso>) => {
      const { data } = await api.post<Ingreso>('/ingresos', payload);
      return data;
    },
    onSuccess: (ingreso) => {
      queryClient.invalidateQueries({ queryKey: ['ingresos'] });
      toast({ title: 'Ingreso registrado', description: ingreso.concepto, variant: 'success' });
    }
  });
};

export const useUpdateIngreso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Ingreso> }) => {
      const { data } = await api.put<Ingreso>(`/ingresos/${id}`, payload);
      return data;
    },
    onSuccess: (ingreso) => {
      queryClient.invalidateQueries({ queryKey: ['ingresos'] });
      queryClient.invalidateQueries({ queryKey: ['ingreso', ingreso.id] });
      toast({ title: 'Ingreso actualizado', description: ingreso.concepto });
    }
  });
};

export const useDeleteIngreso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/ingresos/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingresos'] });
      toast({ title: 'Ingreso eliminado', variant: 'warning' });
    }
  });
};

export const exportIngresosCSV = (ingresos: Ingreso[]) => {
  const header = 'fecha,concepto,importe,fuente,referencia,cuenta,partida,capitulo';
  const rows = ingresos.map((ing) =>
    [ing.fecha, ing.concepto, ing.importe.toFixed(2), ing.fuente, ing.referencia ?? '', ing.cuentaId, ing.partida, ing.capitulo]
      .map((value) => `"${value}"`)
      .join(',')
  );
  downloadFile(`ingresos-${new Date().toISOString()}.csv`, [header, ...rows].join('\n'));
};
