import { api } from '@shared/lib/api';
import type {
  Acta,
  AvanceCurvaS,
  BitacoraEntrada,
  ConfiguracionObras,
  ContratoProcedimiento,
  Estimacion,
  ExpedienteDocumento,
  Obra,
  ProgramaAnualItem,
  ReportePlantilla
} from '@publicWorks/types';

/**
 * Centraliza las operaciones HTTP del módulo de Obras Públicas.
 * Si se habilita un backend real, basta con actualizar `api` (baseURL, headers) en
 * @shared/lib/api o sobreescribir estos métodos para apuntar al servicio remoto.
 */
export const publicWorksApi = {
  async getDashboard() {
    const { data } = await api.get('/obras/dashboard');
    return data as {
      totalProgramadas: number;
      totalProceso: number;
      totalTerminadas: number;
      montoProgramado: number;
      montoEjercido: number;
      avanceFisicoPromedio: number;
      avanceFinancieroPromedio: number;
      obrasRiesgo: Array<{
        id: string;
        nombre: string;
        localidad: string;
        fuente: Obra['fuente'];
        estatus: Obra['estatus'];
        riesgo: 'Alto' | 'Medio' | 'Bajo';
        diasAtraso: number;
        desviacionFinanciera: number;
      }>;
      financiacionPorFuente: Array<{ fuente: Obra['fuente']; programado: number; ejercido: number }>;
      avanceTemporal: Array<{ fecha: string; fisico: number; financiero: number }>;
      estatusDistribucion: Array<{ estatus: Obra['estatus']; total: number }>;
      obrasAlerta: Array<{
        id: string;
        obra: string;
        localidad: string;
        fuente: Obra['fuente'];
        monto: number;
        avanceFisico: number;
        avanceFinanciero: number;
        diasAtraso: number;
        desviacion: number;
      }>;
      fechaCorte: string;
    };
  },

  async listProgramas(filters: Partial<Pick<ProgramaAnualItem, 'ejercicio' | 'fuente' | 'rubro' | 'localidad' | 'estatus'>>) {
    const { data } = await api.get('/obras/programas', { params: filters });
    return data as ProgramaAnualItem[];
  },

  async createPrograma(payload: Omit<ProgramaAnualItem, 'id'>) {
    const { data } = await api.post('/obras/programas', payload);
    return data as ProgramaAnualItem;
  },

  async listObras(filters: Partial<{
    ejercicio: number;
    clave: string;
    nombre: string;
    localidad: string;
    fuente: Obra['fuente'];
    modalidad: Obra['modalidad'];
    contratistaId: string;
    estatus: Obra['estatus'];
  }>) {
    const { data } = await api.get('/obras/catalogo', { params: filters });
    return data as Obra[];
  },

  async createObra(payload: Partial<Obra>) {
    const { data } = await api.post('/obras/catalogo', payload);
    return data as Obra;
  },

  async getObraDetalle(id: string) {
    const { data } = await api.get(`/obras/catalogo/${id}`);
    return data as {
      obra: Obra;
      auditoria: Array<{ ts: string; user: string; action: string }>;
      resumen: {
        montoEjercido: number;
        contratosVigentes: number;
        estimacionesRegistradas: number;
        bitacoraEntradas: number;
        documentosExpediente: number;
      };
      cronograma: Array<{ fase: string; fecha: string; porcentaje: number }>;
      partidas: Array<{ clave: string; descripcion: string; montoProgramado: number; montoEjercido: number }>;
    };
  },

  async listEstimaciones(filters: { obraId?: string; estatus?: Estimacion['estatus']; ejercicio?: number }) {
    const { data } = await api.get('/obras/estimaciones', { params: filters });
    return data as Estimacion[];
  },

  async listEstimacionesPorObra(obraId: string) {
    const { data } = await api.get(`/obras/catalogo/${obraId}/estimaciones`);
    return data as Estimacion[];
  },

  async createEstimacion(estimacion: Estimacion) {
    const { data } = await api.post(`/obras/catalogo/${estimacion.obraId}/estimaciones`, estimacion);
    return data as Estimacion;
  },

  async listBitacora(filters: { obraId?: string; tipo?: BitacoraEntrada['tipo']; fechaDel?: string; fechaAl?: string }) {
    const { data } = await api.get('/obras/bitacora', { params: filters });
    return data as BitacoraEntrada[];
  },

  async listBitacoraPorObra(obraId: string, filters: { tipo?: BitacoraEntrada['tipo']; fechaDel?: string; fechaAl?: string }) {
    const { data } = await api.get(`/obras/catalogo/${obraId}/bitacora`, { params: filters });
    return data as BitacoraEntrada[];
  },

  async createBitacoraEntrada(entry: BitacoraEntrada) {
    const { data } = await api.post(`/obras/catalogo/${entry.obraId}/bitacora`, entry);
    return data as BitacoraEntrada;
  },

  async listExpediente(obraId: string) {
    const { data } = await api.get(`/obras/catalogo/${obraId}/expediente`);
    return data as ExpedienteDocumento[];
  },

  async addExpedienteDocumento(documento: ExpedienteDocumento) {
    const { data } = await api.post(`/obras/catalogo/${documento.obraId}/expediente`, documento);
    return data as ExpedienteDocumento;
  },

  async listContratos(filters: { obraId?: string; modalidad?: ContratoProcedimiento['modalidad'] }) {
    const { data } = await api.get('/obras/contratos', { params: filters });
    return data as ContratoProcedimiento[];
  },

  async listContratosPorObra(obraId: string) {
    const { data } = await api.get(`/obras/catalogo/${obraId}/contratos`);
    return data as ContratoProcedimiento[];
  },

  async createContrato(contrato: ContratoProcedimiento) {
    const { data } = await api.post(`/obras/catalogo/${contrato.obraId}/contratos`, contrato);
    return data as ContratoProcedimiento;
  },

  async listAvances(filters: { obraId?: string }) {
    const { data } = await api.get('/obras/avances', { params: filters });
    return data as AvanceCurvaS[];
  },

  async listAvancesPorObra(obraId: string) {
    const { data } = await api.get(`/obras/catalogo/${obraId}/avances`);
    return data as AvanceCurvaS[];
  },

  async createAvance(avance: AvanceCurvaS) {
    const { data } = await api.post(`/obras/catalogo/${avance.obraId}/avances`, avance);
    return data as AvanceCurvaS;
  },

  async listActas(filters: { obraId?: string; tipo?: Acta['tipo']; estatus?: Acta['estatus'] }) {
    const { data } = await api.get('/obras/actas', { params: filters });
    return data as Acta[];
  },

  async createActa(acta: Acta) {
    const { data } = await api.post('/obras/actas', acta);
    return data as Acta;
  },

  async listReportes() {
    const { data } = await api.get('/obras/reportes');
    return data as ReportePlantilla[];
  },

  async getConfiguracion() {
    const { data } = await api.get('/obras/config');
    return data as ConfiguracionObras;
  },

  async updateConfiguracion(payload: ConfiguracionObras) {
    const { data } = await api.put('/obras/config', payload);
    return data as ConfiguracionObras;
  }
};

