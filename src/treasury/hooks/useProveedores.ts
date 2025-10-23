import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@shared/lib/api';
import type { Proveedor } from '@treasury/types';
import { toast } from '@shared/hooks/useToast';

export const useProveedores = (search?: string) =>
  useQuery({
    queryKey: ['proveedores', search],
    queryFn: async () => {
      const { data } = await api.get<Proveedor[]>('/proveedores', { params: { q: search } });
      return data;
    }
  });

export const useCrearProveedor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Proveedor>) => {
      const { data } = await api.post<Proveedor>('/proveedores', payload);
      return data;
    },
    onSuccess: (proveedor) => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
      toast({ title: 'Proveedor agregado', description: proveedor.nombre, variant: 'success' });
    }
  });
};

export const useActualizarProveedor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Proveedor> }) => {
      const { data } = await api.put<Proveedor>(`/proveedores/${id}`, payload);
      return data;
    },
    onSuccess: (proveedor) => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
      toast({ title: 'Proveedor actualizado', description: proveedor.nombre });
    }
  });
};

export const useEliminarProveedor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/proveedores/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
      toast({ title: 'Proveedor eliminado', variant: 'warning' });
    }
  });
};
