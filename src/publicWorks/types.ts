export type FuenteFin = 'FAISMUN' | 'FORTAMUN' | 'Ramo33' | 'Ramo28' | 'Propios';

export type Modalidad = 'Licitación' | 'Invitación' | 'Adjudicación';

export type ObraEstatus = 'Programada' | 'En proceso' | 'Suspendida' | 'Terminada' | 'Cancelada';

export interface AuditoriaEntry {
  ts: string;
  user: string;
  action: string;
  before?: unknown;
  after?: unknown;
}

export interface Obra {
  id: string;
  ejercicio: number;
  clave: string;
  nombre: string;
  localidad: string;
  fuente: FuenteFin;
  rubro: string;
  montoProgramado: number;
  montoContratado: number;
  montoModificado?: number;
  contratistaId?: string;
  modalidad?: Modalidad;
  fechas: {
    inicioProgramado?: string;
    terminoProgramado?: string;
    inicioReal?: string;
    terminoReal?: string;
    prorroga?: { del: string; al: string } | null;
  };
  avance: {
    fisico: number;
    financiero: number;
    actualizadoEl: string;
  };
  estatus: ObraEstatus;
  riesgo?: 'Alto' | 'Medio' | 'Bajo';
  desviacionFinanciera?: number;
  diasAtraso?: number;
}

export interface BitacoraEntrada {
  id: string;
  obraId: string;
  fecha: string;
  descripcion: string;
  tipo: 'Residente' | 'Supervisión' | 'Observación';
  responsable: string;
  adjuntos?: Array<{ id: string; nombre: string; url?: string }>;
}

export interface EstimacionPartida {
  clave: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
}

export interface Estimacion {
  id: string;
  obraId: string;
  periodo: { del: string; al: string; numero: number };
  importe: {
    directo: number;
    indirecto: number;
    utilidad: number;
    anticipoAplicado: number;
    retenciones: number;
    deducciones: number;
    subtotal: number;
    iva: number;
    total: number;
  };
  partidas: EstimacionPartida[];
  estatus: 'Borrador' | 'En revisión' | 'Aprobada' | 'Enviada a Tesorería';
  auditoria: AuditoriaEntry[];
}

export interface ProgramaAnualItem {
  id: string;
  ejercicio: number;
  programa: string;
  fuente: FuenteFin;
  rubro: string;
  localidad: string;
  montoProgramado: number;
  beneficiarios: number;
  metaFisica: string;
  estatus: 'Planeado' | 'Publicado' | 'En revisión';
  auditoria: AuditoriaEntry[];
}

export interface ExpedienteDocumento {
  id: string;
  obraId: string;
  tipo: string;
  version: number;
  fecha: string;
  responsable: string;
  archivo: {
    nombre: string;
    tipo: string;
    tamano: number;
  };
  comentarios?: string;
}

export interface ContratoProcedimiento {
  id: string;
  obraId: string;
  modalidad: Modalidad;
  descripcion: string;
  fechas: {
    convocatoria: string;
    juntaAclaraciones?: string;
    fallo?: string;
    firma?: string;
  };
  contratistaId: string;
  monto: number;
  anticipo: number;
  plazos: {
    inicio: string;
    termino: string;
  };
  garantias: string[];
  penasConvencionales?: string;
  documentos: Array<{ id: string; nombre: string; tipo: string }>;
  auditoria: AuditoriaEntry[];
}

export interface AvanceCurvaS {
  id: string;
  obraId: string;
  corte: string;
  fisicoProgramado: number;
  fisicoReal: number;
  financieroProgramado: number;
  financieroReal: number;
  comentarios?: string;
}

export interface Acta {
  id: string;
  obraId: string;
  tipo: 'Inicio' | 'Suspensión' | 'Reanudación' | 'Entrega-Recepción' | 'Finiquito';
  folio: string;
  fecha: string;
  estatus: 'Borrador' | 'Firmada' | 'Cerrada';
  version: number;
  participantes: string[];
  hash?: string;
  auditoria: AuditoriaEntry[];
}

export interface ReportePlantilla {
  id: string;
  nombre: string;
  descripcion: string;
  formatos: Array<'PDF' | 'XLSX' | 'XML' | 'JSON'>;
  ultimaGeneracion?: string;
}

export interface ConfiguracionObras {
  fuentes: FuenteFin[];
  localidades: string[];
  rubros: string[];
  modalidades: Modalidad[];
  unidades: string[];
  contratistas: Array<{ id: string; nombre: string }>;
  reglas: {
    umbralRetrasoDias: number;
    umbralDesviacion: number;
    formatoNumeracion: string;
  };
  integraciones: {
    tesoreria: {
      compromisosLectura: boolean;
      preFoliosEnvio: boolean;
    };
  };
}

export interface ObraDetalleResumen {
  obra: Obra;
  auditoria: AuditoriaEntry[];
  resumen: {
    montoEjercido: number;
    contratosVigentes: number;
    estimacionesRegistradas: number;
    bitacoraEntradas: number;
    documentosExpediente: number;
  };
  cronograma: Array<{ fase: string; fecha: string; porcentaje: number }>;
  partidas: Array<{ clave: string; descripcion: string; montoProgramado: number; montoEjercido: number }>;
}

