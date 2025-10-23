import React from 'react';
import { Badge } from './ui/badge';

const statusVariants: Record<string, { label: string; variant: React.ComponentProps<typeof Badge>['variant'] }> = {
  BORRADOR: { label: 'Borrador', variant: 'outline' },
  EN_REVISION: { label: 'En revisión', variant: 'warning' },
  REVISION: { label: 'En revisión', variant: 'warning' },
  RECHAZADO: { label: 'Rechazado', variant: 'destructive' },
  AUTORIZADO: { label: 'Autorizado', variant: 'success' },
  PAGADO: { label: 'Pagado', variant: 'success' },
  APROBADA: { label: 'Aprobada', variant: 'success' },
  ENVIADA_A_TESORERIA: { label: 'Enviada a Tesorería', variant: 'default' },
  PROGRAMADA: { label: 'Programada', variant: 'outline' },
  EN_PROCESO: { label: 'En proceso', variant: 'warning' },
  SUSPENDIDA: { label: 'Suspendida', variant: 'warning' },
  TERMINADA: { label: 'Terminada', variant: 'success' },
  CANCELADA: { label: 'Cancelada', variant: 'destructive' },
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  FIRMADA: { label: 'Firmada', variant: 'success' },
  CERRADA: { label: 'Cerrada', variant: 'default' }
};

const normalizeStatus = (status: string) =>
  status
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .replace(/\s+/g, '_');

export const StatusBadge = ({ status }: { status: string }) => {
  const mapping = statusVariants[normalizeStatus(status)] ?? { label: status, variant: 'outline' };
  return <Badge variant={mapping.variant}>{mapping.label}</Badge>;
};
