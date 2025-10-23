import type { AxiosRequestConfig } from 'axios';
import dayjs from 'dayjs';
import { db } from './db';
import type {
  Compromiso,
  CuentaBancaria,
  Egreso,
  Ingreso,
  MovimientoBancario,
  Partida,
  Presupuesto,
  Proveedor
} from '@treasury/types';
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

export class MockHttpError extends Error {
  status: number;
  statusText?: string;
  payload?: Record<string, unknown>;

  constructor(status: number, message: string, statusText?: string, payload?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.statusText = statusText;
    this.payload = payload;
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseUrl = (url = '') => url.replace(/^\/api/, '').split('?')[0];

const parseBody = (config: AxiosRequestConfig) => {
  if (!config.data) return {};
  if (typeof config.data === 'string') {
    try {
      return JSON.parse(config.data);
    } catch (error) {
      return {};
    }
  }
  return config.data as Record<string, unknown>;
};

const ensureAuth = (config: AxiosRequestConfig) => {
  const header = (config.headers?.Authorization ?? config.headers?.authorization) as string | undefined;
  if (!header) throw new MockHttpError(401, 'No autenticado');
};

const withDelay = async <T>(fn: () => T, ms = 250) => {
  await wait(ms);
  return fn();
};

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const aggregatePresupuesto = () => {
  const presupuesto = db.list('presupuesto') as Presupuesto;
  const compromisos = db.list('compromisos') as Compromiso[];
  const egresos = db.list('egresos') as Egreso[];

  const partidasExtendidas = presupuesto.partidas.map((partida) => {
    const comprometido = compromisos
      .filter((comp) => comp.partida === partida.clave && ['BORRADOR', 'REVISION', 'AUTORIZADO'].includes(comp.estatus))
      .reduce((sum, comp) => sum + comp.importe, 0);
    const devengado = compromisos
      .filter((comp) => comp.partida === partida.clave && ['AUTORIZADO', 'PAGADO', 'CERRADO'].includes(comp.estatus))
      .reduce((sum, comp) => sum + comp.importe, 0);
    const pagado = egresos.filter((eg) => eg.partida === partida.clave && eg.estatus === 'PAGADO').reduce((sum, eg) => sum + eg.importe, 0);
    const disponible = partida.disponible - comprometido;
    return { ...partida, comprometido, devengado, pagado, disponible };
  });

  return { ...presupuesto, partidas: partidasExtendidas };
};

const computeObrasDashboard = () => {
  const obras = db.list('obras') as Obra[];
  const estimaciones = db.list('estimacionesObra') as Estimacion[];
  const avances = db.list('avancesObra') as AvanceCurvaS[];
  const config = db.list('configuracionObras') as ConfiguracionObras;

  const totalProgramadas = obras.filter((obra) => obra.estatus === 'Programada').length;
  const totalProceso = obras.filter((obra) => obra.estatus === 'En proceso').length;
  const totalTerminadas = obras.filter((obra) => obra.estatus === 'Terminada').length;

  const montoProgramado = obras.reduce((sum, obra) => sum + obra.montoProgramado, 0);
  const montoEjercido = estimaciones.reduce((sum, est) => sum + est.importe.total, 0);

  const avanceFisicoPromedio = obras.length
    ? obras.reduce((sum, obra) => sum + obra.avance.fisico, 0) / obras.length
    : 0;
  const avanceFinancieroPromedio = obras.length
    ? obras.reduce((sum, obra) => sum + obra.avance.financiero, 0) / obras.length
    : 0;

  const financiacionPorFuente = obras.reduce<Record<string, { programado: number; ejercido: number }>>((acc, obra) => {
    const key = obra.fuente;
    if (!acc[key]) acc[key] = { programado: 0, ejercido: 0 };
    acc[key].programado += obra.montoProgramado;
    const ejercidoObra = estimaciones
      .filter((est) => est.obraId === obra.id)
      .reduce((sum, est) => sum + est.importe.total, 0);
    acc[key].ejercido += ejercidoObra;
    return acc;
  }, {});

  const avancesAgrupados = avances.reduce<Record<string, AvanceCurvaS[]>>((acc, avance) => {
    const key = dayjs(avance.corte).format('YYYY-MM');
    acc[key] = acc[key] ? [...acc[key], avance] : [avance];
    return acc;
  }, {});

  const avanceTemporal = Object.entries(avancesAgrupados)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([mes, registros]) => ({
      fecha: dayjs(`${mes}-01`).endOf('month').format('YYYY-MM-DD'),
      fisico: registros.reduce((sum, item) => sum + item.fisicoReal, 0) / registros.length,
      financiero: registros.reduce((sum, item) => sum + item.financieroReal, 0) / registros.length
    }));

  const estatusDistribucion = obras.reduce<Record<string, number>>((acc, obra) => {
    acc[obra.estatus] = (acc[obra.estatus] ?? 0) + 1;
    return acc;
  }, {});

  const obraRiesgo = (obra: Obra) => {
    const retraso = obra.diasAtraso ?? 0;
    const desviacion = obra.desviacionFinanciera ?? 0;
    return (
      obra.riesgo === 'Alto' || retraso > config.reglas.umbralRetrasoDias || desviacion > config.reglas.umbralDesviacion
    );
  };

  const obrasRiesgo = obras
    .filter(obraRiesgo)
    .map((obra) => ({
      id: obra.id,
      nombre: obra.nombre,
      localidad: obra.localidad,
      fuente: obra.fuente,
      estatus: obra.estatus,
      riesgo: obra.riesgo ?? 'Medio',
      diasAtraso: obra.diasAtraso ?? 0,
      desviacionFinanciera: obra.desviacionFinanciera ?? 0
    }));

  const obrasAlerta = obras
    .filter(obraRiesgo)
    .map((obra) => ({
      id: obra.id,
      obra: obra.nombre,
      localidad: obra.localidad,
      fuente: obra.fuente,
      monto: obra.montoContratado,
      avanceFisico: obra.avance.fisico,
      avanceFinanciero: obra.avance.financiero,
      diasAtraso: obra.diasAtraso ?? 0,
      desviacion: obra.desviacionFinanciera ?? 0
    }));

  return {
    totalProgramadas,
    totalProceso,
    totalTerminadas,
    montoProgramado,
    montoEjercido,
    avanceFisicoPromedio,
    avanceFinancieroPromedio,
    obrasRiesgo,
    financiacionPorFuente: Object.entries(financiacionPorFuente).map(([fuente, valores]) => ({
      fuente: fuente as Obra['fuente'],
      programado: valores.programado,
      ejercido: valores.ejercido
    })),
    avanceTemporal,
    estatusDistribucion: Object.entries(estatusDistribucion).map(([estatus, total]) => ({
      estatus: estatus as Obra['estatus'],
      total
    })),
    obrasAlerta,
    fechaCorte: dayjs().format('YYYY-MM-DD')
  };
};

const normalizeString = (value: unknown) => String(value ?? '').toLowerCase();

const buildCronogramaFromObra = (obra: Obra) => {
  const inicio = obra.fechas.inicioProgramado ?? obra.avance.actualizadoEl ?? dayjs().format('YYYY-MM-DD');
  const termino = obra.fechas.terminoProgramado ?? dayjs(inicio).add(6, 'month').format('YYYY-MM-DD');
  const midpoint = dayjs(inicio).add(dayjs(termino).diff(dayjs(inicio), 'day') / 2, 'day').format('YYYY-MM-DD');
  return [
    { fase: 'Inicio programado', fecha: inicio, porcentaje: 0 },
    { fase: 'Mitad de obra', fecha: midpoint, porcentaje: 50 },
    { fase: 'Término programado', fecha: termino, porcentaje: 100 }
  ];
};

const buildPartidasFromEstimaciones = (estimaciones: Estimacion[]) => {
  const partidasMap = new Map<string, { clave: string; descripcion: string; montoProgramado: number; montoEjercido: number }>();
  estimaciones.forEach((estimacion) => {
    estimacion.partidas.forEach((partida) => {
      const current = partidasMap.get(partida.clave) ?? {
        clave: partida.clave,
        descripcion: partida.descripcion,
        montoProgramado: 0,
        montoEjercido: 0
      };
      current.montoProgramado += partida.importe;
      current.montoEjercido += partida.importe;
      partidasMap.set(partida.clave, current);
    });
  });
  return Array.from(partidasMap.values());
};

const buildAuditoriaObra = (obra: Obra, estimaciones: Estimacion[], contratos: ContratoProcedimiento[]) =>
  [
    {
      ts: obra.avance.actualizadoEl,
      user: 'Sistema Obras',
      action: 'Actualización de avance físico-financiero'
    },
    ...estimaciones.slice(0, 3).map((estimacion) => ({
      ts: dayjs(estimacion.periodo.al).toISOString(),
      user: 'Residente de obra',
      action: `Estimación ${estimacion.periodo.numero} ${estimacion.estatus}`
    })),
    ...contratos.slice(0, 2).map((contrato) => ({
      ts: dayjs(contrato.fechas.firma ?? contrato.fechas.fallo ?? contrato.fechas.convocatoria).toISOString(),
      user: 'Comité de obra',
      action: `Contrato ${contrato.descripcion} registrado`
    }))
  ].sort((a, b) => dayjs(b.ts).valueOf() - dayjs(a.ts).valueOf());


export const compromisoTransitions: Record<Compromiso['estatus'], Compromiso['estatus'][]> = {
  BORRADOR: ['REVISION'],
  REVISION: ['RECHAZADO', 'AUTORIZADO'],
  RECHAZADO: [],
  AUTORIZADO: ['PAGADO'],
  PAGADO: ['CERRADO'],
  CERRADO: []
};

export const handleRequest = async (config: AxiosRequestConfig) => {
  const method = (config.method ?? 'get').toUpperCase();
  const url = parseUrl(config.url ?? '');
  const params = (config.params ?? {}) as Record<string, unknown>;
  const body = parseBody(config);

  if (url === '/auth/login' && method === 'POST') {
    const { email, password } = body as { email?: string; password?: string };
    if (email === 'tesorero@demo' && password === 'demo1234') {
      return withDelay(() => ({
        status: 200,
        data: {
          token: 'TESORERIA_TOKEN',
          user: {
            email,
            nombre: 'Tesorero Municipal',
            rol: 'TESORERO' as const,
            permisos: ['VER', 'CAPTURAR', 'EDITAR', 'AUTORIZAR'] as const
          }
        }
      }));
    }
    throw new MockHttpError(401, 'Credenciales inválidas');
  }

  ensureAuth(config);

  if (url === '/auth/profile' && method === 'GET') {
    return withDelay(() => ({
      status: 200,
      data: {
        email: 'tesorero@demo',
        nombre: 'Tesorero Municipal',
        rol: 'TESORERO',
        permisos: ['VER', 'CAPTURAR', 'EDITAR', 'AUTORIZAR']
      }
    }));
  }

  if (url === '/obras/dashboard' && method === 'GET') {
    const data = computeObrasDashboard();
    return withDelay(() => ({ status: 200, data }));
  }

  if (url === '/obras/catalogo' && method === 'GET') {
    const obras = db.list('obras') as Obra[];
    const filtered = obras.filter((obra) => {
      const matchEjercicio = params.ejercicio ? obra.ejercicio === Number(params.ejercicio) : true;
      const matchClave = params.clave ? obra.clave.toLowerCase().includes(normalizeString(params.clave)) : true;
      const matchNombre = params.nombre ? obra.nombre.toLowerCase().includes(normalizeString(params.nombre)) : true;
      const matchLocalidad = params.localidad ? obra.localidad === params.localidad : true;
      const matchFuente = params.fuente ? obra.fuente === params.fuente : true;
      const matchModalidad = params.modalidad ? obra.modalidad === params.modalidad : true;
      const matchContratista = params.contratistaId ? obra.contratistaId === params.contratistaId : true;
      const matchEstatus = params.estatus ? obra.estatus === params.estatus : true;
      return matchEjercicio && matchClave && matchNombre && matchLocalidad && matchFuente && matchModalidad && matchContratista && matchEstatus;
    });
    return withDelay(() => ({ status: 200, data: filtered }));
  }

  if (url === '/obras/catalogo' && method === 'POST') {
    const payload = body as Partial<Obra>;
    const insercion = db.insert('obras', {
      ...payload,
      id: payload.id ?? `obra-${crypto.randomUUID()}`,
      avance: payload.avance ?? {
        fisico: 0,
        financiero: 0,
        actualizadoEl: new Date().toISOString()
      },
      estatus: payload.estatus ?? 'Programada',
      fechas: payload.fechas ?? {}
    } as Obra);
    return withDelay(() => ({ status: 201, data: insercion }));
  }

  if (url.startsWith('/obras/catalogo/') && method === 'GET') {
    const segments = url.split('/').filter(Boolean);
    const id = segments[2];
    const subresource = segments[3];

    if (!id) throw new MockHttpError(404, 'Obra no encontrada');

    if (!subresource) {
      const obra = db.find('obras', id) as Obra | undefined;
      if (!obra) throw new MockHttpError(404, 'Obra no encontrada');
      const estimaciones = (db.list('estimacionesObra') as Estimacion[]).filter((item) => item.obraId === id);
      const contratos = (db.list('contratosObra') as ContratoProcedimiento[]).filter((item) => item.obraId === id);
      const bitacoraObra = (db.list('bitacoraObra') as BitacoraEntrada[]).filter((item) => item.obraId === id);
      const expedientes = (db.list('expedientesObra') as ExpedienteDocumento[]).filter((item) => item.obraId === id);

      const resumen = {
        montoEjercido: estimaciones.reduce((sum, item) => sum + item.importe.total, 0),
        contratosVigentes: contratos.length,
        estimacionesRegistradas: estimaciones.length,
        bitacoraEntradas: bitacoraObra.length,
        documentosExpediente: expedientes.length
      };

      const cronograma = buildCronogramaFromObra(obra);
      const partidas = buildPartidasFromEstimaciones(estimaciones);

      return withDelay(() => ({
        status: 200,
        data: {
          obra,
          resumen,
          cronograma,
          partidas,
          auditoria: buildAuditoriaObra(obra, estimaciones, contratos)
        }
      }));
    }

    if (subresource === 'estimaciones') {
      const rows = (db.list('estimacionesObra') as Estimacion[]).filter((item) => item.obraId === id);
      return withDelay(() => ({ status: 200, data: rows }));
    }

    if (subresource === 'bitacora') {
      const rows = (db.list('bitacoraObra') as BitacoraEntrada[])
        .filter((item) => item.obraId === id)
        .filter((item) => {
          const matchTipo = params.tipo ? item.tipo === params.tipo : true;
          const matchDesde = params.fechaDel ? dayjs(item.fecha).isSameOrAfter(dayjs(String(params.fechaDel)), 'day') : true;
          const matchHasta = params.fechaAl ? dayjs(item.fecha).isSameOrBefore(dayjs(String(params.fechaAl)), 'day') : true;
          return matchTipo && matchDesde && matchHasta;
        });
      return withDelay(() => ({ status: 200, data: rows }));
    }

    if (subresource === 'expediente') {
      const rows = (db.list('expedientesObra') as ExpedienteDocumento[]).filter((item) => item.obraId === id);
      return withDelay(() => ({ status: 200, data: rows }));
    }

    if (subresource === 'contratos') {
      const rows = (db.list('contratosObra') as ContratoProcedimiento[]).filter((item) => item.obraId === id);
      return withDelay(() => ({ status: 200, data: rows }));
    }

    if (subresource === 'avances') {
      const rows = (db.list('avancesObra') as AvanceCurvaS[]).filter((item) => item.obraId === id);
      return withDelay(() => ({ status: 200, data: rows }));
    }

    throw new MockHttpError(404, 'Recurso no encontrado');
  }

  if (url.startsWith('/obras/catalogo/') && method === 'POST') {
    const segments = url.split('/').filter(Boolean);
    const id = segments[2];
    const subresource = segments[3];
    if (!id || !subresource) throw new MockHttpError(400, 'Ruta inválida');

    if (subresource === 'estimaciones') {
      const payload = body as Estimacion;
      const inserted = db.insert('estimacionesObra', { ...payload, obraId: id } as Estimacion);
      return withDelay(() => ({ status: 201, data: inserted }));
    }

    if (subresource === 'bitacora') {
      const payload = body as BitacoraEntrada;
      const inserted = db.insert('bitacoraObra', { ...payload, obraId: id } as BitacoraEntrada);
      return withDelay(() => ({ status: 201, data: inserted }));
    }

    if (subresource === 'expediente') {
      const payload = body as ExpedienteDocumento;
      const inserted = db.insert('expedientesObra', { ...payload, obraId: id } as ExpedienteDocumento);
      return withDelay(() => ({ status: 201, data: inserted }));
    }

    if (subresource === 'contratos') {
      const payload = body as ContratoProcedimiento;
      const inserted = db.insert('contratosObra', { ...payload, obraId: id } as ContratoProcedimiento);
      return withDelay(() => ({ status: 201, data: inserted }));
    }

    if (subresource === 'avances') {
      const payload = body as AvanceCurvaS;
      const inserted = db.insert('avancesObra', { ...payload, obraId: id } as AvanceCurvaS);
      return withDelay(() => ({ status: 201, data: inserted }));
    }

    throw new MockHttpError(400, 'Recurso no soportado para inserción');
  }

  if (url === '/obras/programas' && method === 'GET') {
    const programas = db.list('programas') as ProgramaAnualItem[];
    const filtered = programas.filter((programa) => {
      const matchEjercicio = params.ejercicio ? programa.ejercicio === Number(params.ejercicio) : true;
      const matchFuente = params.fuente ? programa.fuente === params.fuente : true;
      const matchRubro = params.rubro ? programa.rubro === params.rubro : true;
      const matchLocalidad = params.localidad ? programa.localidad === params.localidad : true;
      const matchEstatus = params.estatus ? programa.estatus === params.estatus : true;
      return matchEjercicio && matchFuente && matchRubro && matchLocalidad && matchEstatus;
    });
    return withDelay(() => ({ status: 200, data: filtered }));
  }

  if (url === '/obras/programas' && method === 'POST') {
    const payload = body as ProgramaAnualItem;
    const inserted = db.insert('programas', {
      ...payload,
      auditoria: [
        ...(payload.auditoria ?? []),
        { ts: new Date().toISOString(), user: 'Planeación', action: 'Programa registrado desde UI' }
      ]
    });
    return withDelay(() => ({ status: 201, data: inserted }));
  }

  if (url === '/obras/estimaciones' && method === 'GET') {
    const estimaciones = db.list('estimacionesObra') as Estimacion[];
    const filtered = estimaciones.filter((estimacion) => {
      const matchObra = params.obraId ? estimacion.obraId === params.obraId : true;
      const matchEstatus = params.estatus ? estimacion.estatus === params.estatus : true;
      const matchEjercicio = params.ejercicio
        ? dayjs(estimacion.periodo.del).year() === Number(params.ejercicio)
        : true;
      return matchObra && matchEstatus && matchEjercicio;
    });
    return withDelay(() => ({ status: 200, data: filtered }));
  }

  if (url === '/obras/bitacora' && method === 'GET') {
    const bitacora = db.list('bitacoraObra') as BitacoraEntrada[];
    const filtered = bitacora.filter((entrada) => {
      const matchObra = params.obraId ? entrada.obraId === params.obraId : true;
      const matchTipo = params.tipo ? entrada.tipo === params.tipo : true;
      const matchDesde = params.fechaDel ? dayjs(entrada.fecha).isSameOrAfter(dayjs(String(params.fechaDel)), 'day') : true;
      const matchHasta = params.fechaAl ? dayjs(entrada.fecha).isSameOrBefore(dayjs(String(params.fechaAl)), 'day') : true;
      return matchObra && matchTipo && matchDesde && matchHasta;
    });
    return withDelay(() => ({ status: 200, data: filtered }));
  }

  if (url === '/obras/contratos' && method === 'GET') {
    const contratos = db.list('contratosObra') as ContratoProcedimiento[];
    const filtered = contratos.filter((contrato) => {
      const matchObra = params.obraId ? contrato.obraId === params.obraId : true;
      const matchModalidad = params.modalidad ? contrato.modalidad === params.modalidad : true;
      return matchObra && matchModalidad;
    });
    return withDelay(() => ({ status: 200, data: filtered }));
  }

  if (url === '/obras/avances' && method === 'GET') {
    const avances = db.list('avancesObra') as AvanceCurvaS[];
    const filtered = avances.filter((avance) => (params.obraId ? avance.obraId === params.obraId : true));
    return withDelay(() => ({ status: 200, data: filtered }));
  }

  if (url === '/obras/actas' && method === 'GET') {
    const actas = db.list('actasObra') as Acta[];
    const filtered = actas.filter((acta) => {
      const matchObra = params.obraId ? acta.obraId === params.obraId : true;
      const matchTipo = params.tipo ? acta.tipo === params.tipo : true;
      const matchEstatus = params.estatus ? acta.estatus === params.estatus : true;
      return matchObra && matchTipo && matchEstatus;
    });
    return withDelay(() => ({ status: 200, data: filtered }));
  }

  if (url === '/obras/actas' && method === 'POST') {
    const payload = body as Acta;
    const inserted = db.insert('actasObra', {
      ...payload,
      auditoria: [
        ...(payload.auditoria ?? []),
        { ts: new Date().toISOString(), user: 'Coordinador de obra', action: 'Acta generada en el sistema' }
      ]
    });
    return withDelay(() => ({ status: 201, data: inserted }));
  }

  if (url === '/obras/reportes' && method === 'GET') {
    const reportes = db.list('reportesObra') as ReportePlantilla[];
    return withDelay(() => ({ status: 200, data: reportes }));
  }

  if (url === '/obras/config' && method === 'GET') {
    const configuracion = db.find('configuracionObras', 'config') ?? db.list('configuracionObras');
    return withDelay(() => ({ status: 200, data: configuracion }));
  }

  if (url === '/obras/config' && method === 'PUT') {
    const payload = body as ConfiguracionObras;
    const updated = db.update('configuracionObras', 'config', payload);
    return withDelay(() => ({ status: 200, data: updated }));
  }

  if (url === '/dashboard/tesoreria' && method === 'GET') {
    const ingresos = db.list('ingresos') as Ingreso[];
    const egresos = db.list('egresos') as Egreso[];
    const compromisos = db.list('compromisos') as Compromiso[];
    const presupuesto = aggregatePresupuesto();
    const movimientos = db.list('movimientos') as MovimientoBancario[];
    const mesActual = dayjs().month();
    const ingresosMes = ingresos.filter((ing) => dayjs(ing.fecha).month() === mesActual);
    const egresosMes = egresos.filter((eg) => dayjs(eg.fecha).month() === mesActual);
    const metaMensual = 1_200_000;
    const porVencer = compromisos.filter((comp) => dayjs(comp.fechaProgramada).diff(dayjs(), 'day') <= 7 && !['PAGADO', 'CERRADO'].includes(comp.estatus));
    const alertasConciliacion = movimientos.filter((mov) => !mov.conciliado && dayjs(mov.fecha).isBefore(dayjs().subtract(5, 'day')));
    const bitacoraReciente = compromisos.flatMap((comp) => comp.bitacora.map((item) => ({ ...item, entidad: comp.concepto }))).slice(0, 10);
    const tareas = compromisos.filter((comp) => comp.estatus === 'REVISION' || comp.estatus === 'AUTORIZADO');

    return withDelay(() => ({
      status: 200,
      data: {
        ingresosMes: ingresosMes.reduce((sum, item) => sum + item.importe, 0),
        metaMensual,
        egresosCapitulo: egresosMes.reduce<Record<string, number>>((acc, item) => {
          acc[item.capitulo] = (acc[item.capitulo] ?? 0) + item.importe;
          return acc;
        }, {}),
        avancePresupuestal: presupuesto.partidas.map((partida) => ({
          clave: partida.clave,
          nombre: partida.nombre,
          disponible: partida.disponible,
          pagado: partida.pagado
        })),
        compromisosPorVencer: porVencer,
        alertasConciliacion,
        bitacoraReciente,
        tareasHoy: tareas
      }
    }));
  }

  if (url === '/ingresos' && method === 'GET') {
    const ingresos = db.list('ingresos') as Ingreso[];
    const filtered = ingresos.filter((ingreso) => {
      const matchesTexto = params.q
        ? ingreso.concepto.toLowerCase().includes(String(params.q).toLowerCase()) ||
          ingreso.referencia?.toLowerCase().includes(String(params.q).toLowerCase())
        : true;
      const fechaInicio = params.fechaInicio ? dayjs(params.fechaInicio as string) : null;
      const fechaFin = params.fechaFin ? dayjs(params.fechaFin as string) : null;
      const matchesFecha = (!fechaInicio || dayjs(ingreso.fecha).isSameOrAfter(fechaInicio, 'day')) &&
        (!fechaFin || dayjs(ingreso.fecha).isSameOrBefore(fechaFin, 'day'));
      const matchesFuente = params.fuente ? ingreso.fuente === params.fuente : true;
      const matchesCuenta = params.cuentaId ? ingreso.cuentaId === params.cuentaId : true;
      return matchesTexto && matchesFecha && matchesFuente && matchesCuenta;
    });
    return withDelay(() => ({ status: 200, data: filtered }));
  }

  if (url?.startsWith('/ingresos/') && method === 'GET') {
    const id = url.split('/')[2];
    const ingreso = db.find('ingresos', id) as Ingreso | undefined;
    if (!ingreso) throw new MockHttpError(404, 'Ingreso no encontrado');
    return withDelay(() => ({ status: 200, data: ingreso }));
  }

  if (url === '/ingresos' && method === 'POST') {
    const payload = body as Partial<Ingreso>;
    const ingreso = db.insert('ingresos', {
      ...(payload as Ingreso),
      bitacora: [
        {
          ts: new Date().toISOString(),
          user: 'TESORERO',
          action: 'Ingreso capturado'
        }
      ]
    } as Ingreso);
    return withDelay(() => ({ status: 201, data: ingreso }));
  }

  if (url?.startsWith('/ingresos/') && method === 'PUT') {
    const id = url.split('/')[2];
    const ingresoActual = db.find('ingresos', id) as Ingreso | undefined;
    if (!ingresoActual) throw new MockHttpError(404, 'Ingreso no encontrado');
    const updates = body as Partial<Ingreso>;
    const ingreso = db.update('ingresos', id, {
      ...updates,
      bitacora: [
        ...ingresoActual.bitacora,
        {
          ts: new Date().toISOString(),
          user: 'TESORERO',
          action: 'Ingreso actualizado',
          after: updates
        }
      ]
    } as Ingreso);
    return withDelay(() => ({ status: 200, data: ingreso }));
  }

  if (url?.startsWith('/ingresos/') && method === 'DELETE') {
    const id = url.split('/')[2];
    db.delete('ingresos', id);
    return withDelay(() => ({ status: 204, data: null }));
  }

  if (url === '/egresos' && method === 'GET') {
    const egresos = db.list('egresos') as Egreso[];
    const filtered = egresos.filter((egreso) => {
      const matchesTexto = params.q
        ? egreso.concepto.toLowerCase().includes(String(params.q).toLowerCase())
        : true;
      const matchesProveedor = params.proveedorId ? egreso.proveedorId === params.proveedorId : true;
      const matchesEstatus = params.estatus ? egreso.estatus === params.estatus : true;
      const fechaInicio = params.fechaInicio ? dayjs(params.fechaInicio as string) : null;
      const fechaFin = params.fechaFin ? dayjs(params.fechaFin as string) : null;
      const matchesFecha = (!fechaInicio || dayjs(egreso.fecha).isSameOrAfter(fechaInicio, 'day')) &&
        (!fechaFin || dayjs(egreso.fecha).isSameOrBefore(fechaFin, 'day'));
      return matchesTexto && matchesProveedor && matchesEstatus && matchesFecha;
    });
    return withDelay(() => ({ status: 200, data: filtered }));
  }

  if (url?.startsWith('/egresos/') && method === 'GET') {
    const id = url.split('/')[2];
    const egreso = db.find('egresos', id) as Egreso | undefined;
    if (!egreso) throw new MockHttpError(404, 'Egreso no encontrado');
    return withDelay(() => ({ status: 200, data: egreso }));
  }

  if (url === '/egresos' && method === 'POST') {
    const payload = body as Partial<Egreso>;
    const egreso = db.insert('egresos', {
      ...(payload as Egreso),
      bitacora: [
        {
          ts: new Date().toISOString(),
          user: 'TESORERO',
          action: 'Egreso capturado'
        }
      ]
    } as Egreso);
    return withDelay(() => ({ status: 201, data: egreso }));
  }

  if (url?.startsWith('/egresos/') && method === 'PUT') {
    const id = url.split('/')[2];
    const egresoActual = db.find('egresos', id) as Egreso | undefined;
    if (!egresoActual) throw new MockHttpError(404, 'Egreso no encontrado');
    const updates = body as Partial<Egreso>;
    const egreso = db.update('egresos', id, {
      ...updates,
      bitacora: [
        ...egresoActual.bitacora,
        {
          ts: new Date().toISOString(),
          user: 'TESORERO',
          action: 'Egreso actualizado',
          after: updates
        }
      ]
    } as Egreso);
    return withDelay(() => ({ status: 200, data: egreso }));
  }

  if (url?.startsWith('/egresos/') && method === 'DELETE') {
    const id = url.split('/')[2];
    db.delete('egresos', id);
    return withDelay(() => ({ status: 204, data: null }));
  }

  if (url === '/compromisos' && method === 'GET') {
    const compromisos = db.list('compromisos') as Compromiso[];
    const filtered = compromisos.filter((comp) => {
      const matchesStatus = params.estatus ? comp.estatus === params.estatus : true;
      const matchesProveedor = params.proveedorId ? comp.proveedor.id === params.proveedorId : true;
      const termino = params.q ? String(params.q).toLowerCase() : '';
      const matchesTexto = termino ? comp.concepto.toLowerCase().includes(termino) : true;
      const fechaInicio = params.fechaInicio ? dayjs(params.fechaInicio as string) : null;
      const fechaFin = params.fechaFin ? dayjs(params.fechaFin as string) : null;
      const matchesFecha = (!fechaInicio || dayjs(comp.fechaDocumento).isSameOrAfter(fechaInicio, 'day')) &&
        (!fechaFin || dayjs(comp.fechaDocumento).isSameOrBefore(fechaFin, 'day'));
      return matchesStatus && matchesProveedor && matchesTexto && matchesFecha;
    });
    return withDelay(() => ({ status: 200, data: filtered }));
  }

  if (url?.startsWith('/compromisos/') && method === 'GET') {
    const id = url.split('/')[2];
    const compromiso = db.find('compromisos', id) as Compromiso | undefined;
    if (!compromiso) throw new MockHttpError(404, 'Compromiso no encontrado');
    return withDelay(() => ({ status: 200, data: compromiso }));
  }

  if (url === '/compromisos' && method === 'POST') {
    const payload = body as Compromiso;
    const compromiso = db.insert('compromisos', {
      ...payload,
      estatus: 'BORRADOR',
      bitacora: [
        ...(payload.bitacora ?? []),
        {
          ts: new Date().toISOString(),
          user: 'TESORERO',
          action: 'Compromiso creado'
        }
      ]
    } as Compromiso);
    return withDelay(() => ({ status: 201, data: compromiso }));
  }

  if (url?.startsWith('/compromisos/') && method === 'PUT') {
    const id = url.split('/')[2];
    const actual = db.find('compromisos', id) as Compromiso | undefined;
    if (!actual) throw new MockHttpError(404, 'Compromiso no encontrado');
    const updates = body as Partial<Compromiso>;
    const compromiso = db.update('compromisos', id, {
      ...updates,
      bitacora: [
        ...actual.bitacora,
        {
          ts: new Date().toISOString(),
          user: 'TESORERO',
          action: 'Compromiso actualizado',
          after: updates
        }
      ]
    } as Compromiso);
    return withDelay(() => ({ status: 200, data: compromiso }));
  }

  if (url?.startsWith('/compromisos/') && method === 'POST') {
    const [, , id, action] = url.split('/');
    if (action !== 'transition') throw new MockHttpError(404, 'Acción no encontrada');
    const actual = db.find('compromisos', id) as Compromiso | undefined;
    if (!actual) throw new MockHttpError(404, 'Compromiso no encontrado');
    const { estatus, motivo, refPago, fechaPago } = body as {
      estatus: Compromiso['estatus'];
      motivo?: string;
      refPago?: string;
      fechaPago?: string;
    };
    const permitidos = compromisoTransitions[actual.estatus] ?? [];
    if (!permitidos.includes(estatus)) {
      throw new MockHttpError(422, 'Transición no permitida', 'Unprocessable Entity', { actual: actual.estatus, destino: estatus });
    }
    if (estatus === 'RECHAZADO' && !motivo) {
      throw new MockHttpError(422, 'Debe capturar el motivo del rechazo');
    }
    const bitacoraEntry = {
      ts: new Date().toISOString(),
      user: 'TESORERO',
      action: `Cambio de estatus ${actual.estatus} → ${estatus}`,
      after: { motivo, refPago, fechaPago }
    };
    const compromiso = db.update('compromisos', id, {
      estatus,
      refPago: refPago ?? actual.refPago,
      bitacora: [...actual.bitacora, bitacoraEntry]
    } as Compromiso);
    return withDelay(() => ({ status: 200, data: compromiso }));
  }

  if (url === '/presupuesto' && method === 'GET') {
    const presupuesto = aggregatePresupuesto();
    return withDelay(() => ({ status: 200, data: presupuesto }));
  }

  if (url === '/presupuesto/modificaciones' && method === 'POST') {
    const { partida, monto, motivo } = body as { partida: string; monto: number; motivo: string };
    const presupuesto = db.list('presupuesto') as Presupuesto;
    const partidaIdx = presupuesto.partidas.findIndex((item) => item.clave === partida);
    if (partidaIdx === -1) throw new MockHttpError(404, 'Partida no encontrada');
    presupuesto.partidas[partidaIdx].disponible += monto;
    presupuesto.actualizado = new Date().toISOString();
    const updated = db.update('presupuesto', presupuesto.id, presupuesto as unknown as Presupuesto);
    return withDelay(() => ({ status: 200, data: { ...updated, motivo } }));
  }

  if (url === '/proveedores' && method === 'GET') {
    const proveedores = db.list('proveedores') as Proveedor[];
    const filtered = proveedores.filter((prov) =>
      params.q ? prov.nombre.toLowerCase().includes(String(params.q).toLowerCase()) : true
    );
    return withDelay(() => ({ status: 200, data: filtered }));
  }

  if (url === '/proveedores' && method === 'POST') {
    const proveedor = db.insert('proveedores', body as Proveedor);
    return withDelay(() => ({ status: 201, data: proveedor }));
  }

  if (url?.startsWith('/proveedores/') && method === 'PUT') {
    const id = url.split('/')[2];
    const proveedor = db.update('proveedores', id, body as Partial<Proveedor>);
    return withDelay(() => ({ status: 200, data: proveedor }));
  }

  if (url?.startsWith('/proveedores/') && method === 'DELETE') {
    const id = url.split('/')[2];
    db.delete('proveedores', id);
    return withDelay(() => ({ status: 204, data: null }));
  }

  if (url === '/bancos' && method === 'GET') {
    return withDelay(() => ({ status: 200, data: db.list('cuentas') as CuentaBancaria[] }));
  }

  if (url === '/bancos' && method === 'POST') {
    const cuenta = db.insert('cuentas', body as CuentaBancaria);
    return withDelay(() => ({ status: 201, data: cuenta }));
  }

  if (url?.startsWith('/bancos/') && method === 'PUT') {
    const id = url.split('/')[2];
    const cuenta = db.update('cuentas', id, body as Partial<CuentaBancaria>);
    return withDelay(() => ({ status: 200, data: cuenta }));
  }

  if (url === '/movimientos' && method === 'GET') {
    const movimientos = db.list('movimientos') as MovimientoBancario[];
    const filtered = movimientos.filter((mov) => {
      const matchCuenta = params.cuentaId ? mov.cuentaId === params.cuentaId : true;
      const matchConciliado = params.conciliado !== undefined ? mov.conciliado === (params.conciliado === 'true') : true;
      return matchCuenta && matchConciliado;
    });
    return withDelay(() => ({ status: 200, data: filtered }));
  }

  if (url === '/movimientos' && method === 'POST') {
    const movimiento = db.insert('movimientos', body as MovimientoBancario);
    return withDelay(() => ({ status: 201, data: movimiento }));
  }

  if (url === '/movimientos/import' && method === 'POST') {
    const lista = body as MovimientoBancario[];
    const registros = lista.map((mov) => db.insert('movimientos', mov));
    return withDelay(() => ({ status: 201, data: registros }));
  }

  if (url?.startsWith('/movimientos/') && method === 'PUT') {
    const id = url.split('/')[2];
    const movimiento = db.update('movimientos', id, body as Partial<MovimientoBancario>);
    return withDelay(() => ({ status: 200, data: movimiento }));
  }

  if (url === '/conciliacion/match' && method === 'POST') {
    const { ids, conciliado } = body as { ids: string[]; conciliado: boolean };
    ids.forEach((id) => {
      try {
        db.update('movimientos', id, { conciliado });
      } catch (error) {
        // ignorar registros inexistentes en la simulación
      }
    });
    return withDelay(() => ({ status: 200, data: ids }));
  }

  if (url === '/reportes' && method === 'GET') {
    const ingresos = db.list('ingresos') as Ingreso[];
    const egresos = db.list('egresos') as Egreso[];
    const compromisos = db.list('compromisos') as Compromiso[];
    const filtroCuenta = params.cuentaId ? String(params.cuentaId) : null;
    const filtroCapitulo = params.capitulo ? String(params.capitulo) : null;
    const fechaInicio = params.fechaInicio ? dayjs(String(params.fechaInicio)) : null;
    const fechaFin = params.fechaFin ? dayjs(String(params.fechaFin)) : null;

    const filtrarFecha = (fecha: string) =>
      (!fechaInicio || dayjs(fecha).isSameOrAfter(fechaInicio, 'day')) &&
      (!fechaFin || dayjs(fecha).isSameOrBefore(fechaFin, 'day'));

    const libroIngresos = ingresos
      .filter((ing) => filtrarFecha(ing.fecha) && (!filtroCuenta || ing.cuentaId === filtroCuenta))
      .map((ing) => ({ tipo: 'Ingreso', fecha: ing.fecha, concepto: ing.concepto, importe: ing.importe }));

    const libroEgresos = egresos
      .filter((eg) => filtrarFecha(eg.fecha) && (!filtroCuenta || eg.cuentaId === filtroCuenta))
      .map((eg) => ({ tipo: 'Egreso', fecha: eg.fecha, concepto: eg.concepto, importe: eg.importe, proveedorId: eg.proveedorId }));

    const compromisosPorEstatus = compromisos.reduce<Record<string, { total: number; items: Compromiso[] }>>((acc, comp) => {
      if (!filtrarFecha(comp.fechaDocumento)) return acc;
      if (filtroCapitulo && comp.capitulo !== filtroCapitulo) return acc;
      const bucket = acc[comp.estatus] ?? { total: 0, items: [] };
      bucket.total += comp.importe;
      bucket.items.push(comp);
      acc[comp.estatus] = bucket;
      return acc;
    }, {});

    const flujoCaja = libroIngresos.reduce((sum, ingreso) => sum + ingreso.importe, 0) -
      libroEgresos.reduce((sum, egreso) => sum + egreso.importe, 0);

    return withDelay(() => ({
      status: 200,
      data: {
        libroIngresos,
        libroEgresos,
        compromisosPorEstatus,
        flujoCaja
      }
    }));
  }

  throw new MockHttpError(404, 'Recurso no encontrado');
};
