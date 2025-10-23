import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { publicWorksApi } from '@publicWorks/services/publicWorksApi';
import type { Modalidad, Obra, ObraDetalleResumen, ObraEstatus } from '@publicWorks/types';

export interface ObrasFilters {
  ejercicio?: number;
  clave?: string;
  nombre?: string;
  localidad?: string;
  fuente?: Obra['fuente'];
  modalidad?: Modalidad;
  contratistaId?: string;
  estatus?: ObraEstatus;
}

export const useObrasCatalogo = (filters: ObrasFilters) =>
  useQuery({
    queryKey: ['obras', 'catalogo', filters],
    queryFn: () => publicWorksApi.listObras(filters)
  });

export type CrearObraPayload = Omit<Obra, 'id' | 'avance' | 'fechas'> & {
  fechas: Obra['fechas'];
  avance?: Obra['avance'];
};

export const useCrearObra = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearObraPayload) => publicWorksApi.createObra(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras', 'catalogo'] });
      queryClient.invalidateQueries({ queryKey: ['obras', 'dashboard'] });
    }
  });
};

export const useObraDetalle = (obraId?: string) =>
  useQuery({
    queryKey: ['obras', 'catalogo', obraId],
    queryFn: async () => {
      if (!obraId) return null;
      const data = await publicWorksApi.getObraDetalle(obraId);
      return data as ObraDetalleResumen;
    },
    enabled: Boolean(obraId)
  });
