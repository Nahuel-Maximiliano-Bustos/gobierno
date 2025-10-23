const dictionary: Record<string, string> = {
  'app.title': 'Tesorería Municipal',
  'app.subtitle': 'Control presupuestal y financiero del municipio',
  'actions.create': 'Crear',
  'actions.edit': 'Editar',
  'actions.delete': 'Eliminar',
  'actions.save': 'Guardar cambios',
  'actions.cancel': 'Cancelar',
  'actions.export': 'Exportar',
  'status.pending': 'Pendiente',
  'status.paid': 'Pagado'
};

export const t = (key: string, fallback?: string) => dictionary[key] ?? fallback ?? key;
