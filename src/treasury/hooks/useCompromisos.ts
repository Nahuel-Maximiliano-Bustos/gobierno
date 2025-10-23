import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@shared/lib/api';
import type { Compromiso, EstatusCompromiso } from '@treasury/types';
import { toast } from '@shared/hooks/useToast';

export interface CompromisosFilters {
  q?: string;
  estatus?: EstatusCompromiso;
  proveedorId?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export const useCompromisos = (filters?: CompromisosFilters) =>
  useQuery({
    queryKey: ['compromisos', filters],
    queryFn: async () => {
      const { data } = await api.get<Compromiso[]>('/compromisos', { params: filters });
      return data;
    }
  });

export const useCompromiso = (id?: string) =>
  useQuery({
    queryKey: ['compromiso', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<Compromiso>(`/compromisos/${id}`);
      return data;
    },
    enabled: Boolean(id)
  });

export const useCreateCompromiso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Compromiso) => {
      const { data } = await api.post<Compromiso>('/compromisos', payload);
      return data;
    },
    onSuccess: (compromiso) => {
      queryClient.invalidateQueries({ queryKey: ['compromisos'] });
      toast({ title: 'Compromiso creado', description: compromiso.concepto, variant: 'success' });
    }
  });
};

export const useUpdateCompromiso = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Compromiso> }) => {
      const { data } = await api.put<Compromiso>(`/compromisos/${id}`, payload);
      return data;
    },
    onSuccess: (compromiso) => {
      queryClient.invalidateQueries({ queryKey: ['compromisos'] });
      queryClient.invalidateQueries({ queryKey: ['compromiso', compromiso.id] });
      toast({ title: 'Compromiso actualizado', description: compromiso.concepto });
    }
  });
};

export const useCompromisoTransition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      estatus,
      motivo,
      refPago,
      fechaPago
    }: {
      id: string;
      estatus: EstatusCompromiso;
      motivo?: string;
      refPago?: string;
      fechaPago?: string;
    }) => {
      const { data } = await api.post<Compromiso>(`/compromisos/${id}/transition`, {
        estatus,
        motivo,
        refPago,
        fechaPago
      });
      return data;
    },
    onSuccess: (compromiso) => {
      queryClient.invalidateQueries({ queryKey: ['compromisos'] });
      queryClient.invalidateQueries({ queryKey: ['compromiso', compromiso.id] });
      toast({ title: 'Estatus actualizado', description: `${compromiso.estatus}` });
    }
  });
};
