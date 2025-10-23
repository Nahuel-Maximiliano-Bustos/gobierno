import dayjs from 'dayjs';
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

const contratistas = [
  { id: 'cont-001', nombre: 'Infraestructura del Centro SA de CV' },
  { id: 'cont-002', nombre: 'Constructora Horizonte MX' },
  { id: 'cont-003', nombre: 'Servicios Urbanos Integrales' }
];

const obras: Obra[] = [
  {
    id: 'obra-001',
    ejercicio: 2024,
    clave: 'OP-2024-001',
    nombre: 'Rehabilitación de camino rural San Miguel',
    localidad: 'San Miguel',
    fuente: 'FAISMUN',
    rubro: 'Infraestructura vial',
    montoProgramado: 4_500_000,
    montoContratado: 4_200_000,
    montoModificado: 4_450_000,
    contratistaId: 'cont-001',
    modalidad: 'Licitación',
    fechas: {
      inicioProgramado: '2024-02-05',
      terminoProgramado: '2024-07-30',
      inicioReal: '2024-02-10'
    },
    avance: {
      fisico: 58,
      financiero: 62,
      actualizadoEl: '2024-04-15'
    },
    estatus: 'En proceso',
    riesgo: 'Medio',
    desviacionFinanciera: 6,
    diasAtraso: 8
  },
  {
    id: 'obra-002',
    ejercicio: 2024,
    clave: 'OP-2024-002',
    nombre: 'Modernización de alumbrado LED zona centro',
    localidad: 'Cabecera Municipal',
    fuente: 'FORTAMUN',
    rubro: 'Servicios urbanos',
    montoProgramado: 3_200_000,
    montoContratado: 3_050_000,
    montoModificado: 3_100_000,
    contratistaId: 'cont-002',
    modalidad: 'Invitación',
    fechas: {
      inicioProgramado: '2024-01-15',
      terminoProgramado: '2024-04-20',
      inicioReal: '2024-01-15',
      terminoReal: '2024-04-10'
    },
    avance: {
      fisico: 100,
      financiero: 100,
      actualizadoEl: '2024-04-12'
    },
    estatus: 'Terminada',
    riesgo: 'Bajo',
    desviacionFinanciera: 1,
    diasAtraso: 0
  },
  {
    id: 'obra-003',
    ejercicio: 2024,
    clave: 'OP-2024-003',
    nombre: 'Construcción de pavimento hidráulico Col. Hidalgo',
    localidad: 'Colonia Hidalgo',
    fuente: 'Ramo33',
    rubro: 'Pavimentación',
    montoProgramado: 6_800_000,
    montoContratado: 6_500_000,
    montoModificado: 6_950_000,
    contratistaId: 'cont-002',
    modalidad: 'Licitación',
    fechas: {
      inicioProgramado: '2024-03-01',
      terminoProgramado: '2024-09-15',
      inicioReal: '2024-03-05'
    },
    avance: {
      fisico: 42,
      financiero: 48,
      actualizadoEl: '2024-05-05'
    },
    estatus: 'En proceso',
    riesgo: 'Medio',
    desviacionFinanciera: 7,
    diasAtraso: 12
  },
  {
    id: 'obra-004',
    ejercicio: 2025,
    clave: 'OP-2025-001',
    nombre: 'Rehabilitación de pozo profundo La Esperanza',
    localidad: 'La Esperanza',
    fuente: 'Ramo28',
    rubro: 'Agua potable',
    montoProgramado: 2_300_000,
    montoContratado: 2_200_000,
    contratistaId: 'cont-003',
    modalidad: 'Adjudicación',
    fechas: {
      inicioProgramado: '2025-01-20',
      terminoProgramado: '2025-03-30'
    },
    avance: {
      fisico: 18,
      financiero: 22,
      actualizadoEl: '2025-02-28'
    },
    estatus: 'En proceso',
    riesgo: 'Bajo',
    desviacionFinanciera: 4,
    diasAtraso: 0
  },
  {
    id: 'obra-005',
    ejercicio: 2024,
    clave: 'OP-2024-005',
    nombre: 'Construcción de techumbre escolar Escuela Primaria Benito Juárez',
    localidad: 'San José',
    fuente: 'FAISMUN',
    rubro: 'Infraestructura educativa',
    montoProgramado: 1_450_000,
    montoContratado: 1_380_000,
    contratistaId: 'cont-003',
    modalidad: 'Invitación',
    fechas: {
      inicioProgramado: '2024-02-10',
      terminoProgramado: '2024-05-15',
      inicioReal: '2024-02-12'
    },
    avance: {
      fisico: 74,
      financiero: 70,
      actualizadoEl: '2024-04-25'
    },
    estatus: 'En proceso',
    riesgo: 'Bajo',
    desviacionFinanciera: -4,
    diasAtraso: 5
  },
  {
    id: 'obra-006',
    ejercicio: 2025,
    clave: 'OP-2025-002',
    nombre: 'Construcción de Centro Comunitario El Rosario',
    localidad: 'El Rosario',
    fuente: 'Propios',
    rubro: 'Infraestructura social',
    montoProgramado: 5_100_000,
    montoContratado: 5_000_000,
    contratistaId: 'cont-001',
    modalidad: 'Licitación',
    fechas: {
      inicioProgramado: '2025-04-05',
      terminoProgramado: '2025-10-20'
    },
    avance: {
      fisico: 12,
      financiero: 15,
      actualizadoEl: '2025-05-18'
    },
    estatus: 'Programada',
    riesgo: 'Bajo',
    desviacionFinanciera: 3,
    diasAtraso: 0
  },
  {
    id: 'obra-007',
    ejercicio: 2024,
    clave: 'OP-2024-006',
    nombre: 'Rehabilitación de red de drenaje Col. Juárez',
    localidad: 'Colonia Juárez',
    fuente: 'Ramo33',
    rubro: 'Drenaje y saneamiento',
    montoProgramado: 2_900_000,
    montoContratado: 2_750_000,
    contratistaId: 'cont-001',
    modalidad: 'Invitación',
    fechas: {
      inicioProgramado: '2024-04-01',
      terminoProgramado: '2024-07-31'
    },
    avance: {
      fisico: 28,
      financiero: 32,
      actualizadoEl: '2024-05-15'
    },
    estatus: 'En proceso',
    riesgo: 'Medio',
    desviacionFinanciera: 4,
    diasAtraso: 6
  },
  {
    id: 'obra-008',
    ejercicio: 2024,
    clave: 'OP-2024-007',
    nombre: 'Ampliación de red de agua potable Rancho Nuevo',
    localidad: 'Rancho Nuevo',
    fuente: 'FAISMUN',
    rubro: 'Agua potable',
    montoProgramado: 1_850_000,
    montoContratado: 1_820_000,
    contratistaId: 'cont-002',
    modalidad: 'Adjudicación',
    fechas: {
      inicioProgramado: '2024-03-20',
      terminoProgramado: '2024-06-10',
      inicioReal: '2024-03-22'
    },
    avance: {
      fisico: 66,
      financiero: 61,
      actualizadoEl: '2024-05-01'
    },
    estatus: 'En proceso',
    riesgo: 'Bajo',
    desviacionFinanciera: -5,
    diasAtraso: 3
  },
  {
    id: 'obra-009',
    ejercicio: 2024,
    clave: 'OP-2024-008',
    nombre: 'Rehabilitación de parque La Loma',
    localidad: 'La Loma',
    fuente: 'Propios',
    rubro: 'Espacios públicos',
    montoProgramado: 1_100_000,
    montoContratado: 1_050_000,
    contratistaId: 'cont-003',
    modalidad: 'Invitación',
    fechas: {
      inicioProgramado: '2024-01-20',
      terminoProgramado: '2024-03-30',
      inicioReal: '2024-01-25',
      terminoReal: '2024-03-28'
    },
    avance: {
      fisico: 100,
      financiero: 100,
      actualizadoEl: '2024-03-30'
    },
    estatus: 'Terminada',
    riesgo: 'Bajo',
    desviacionFinanciera: 0,
    diasAtraso: 0
  },
  {
    id: 'obra-010',
    ejercicio: 2024,
    clave: 'OP-2024-009',
    nombre: 'Puente vehicular Río Chico',
    localidad: 'Río Chico',
    fuente: 'Ramo33',
    rubro: 'Infraestructura vial',
    montoProgramado: 9_500_000,
    montoContratado: 9_100_000,
    contratistaId: 'cont-001',
    modalidad: 'Licitación',
    fechas: {
      inicioProgramado: '2024-05-01',
      terminoProgramado: '2024-12-15'
    },
    avance: {
      fisico: 8,
      financiero: 10,
      actualizadoEl: '2024-05-10'
    },
    estatus: 'Programada',
    riesgo: 'Bajo',
    desviacionFinanciera: 2,
    diasAtraso: 0
  },
  {
    id: 'obra-011',
    ejercicio: 2025,
    clave: 'OP-2025-003',
    nombre: 'Pavimentación con empedrado San Rafael',
    localidad: 'San Rafael',
    fuente: 'FAISMUN',
    rubro: 'Pavimentación',
    montoProgramado: 2_200_000,
    montoContratado: 2_170_000,
    contratistaId: 'cont-002',
    modalidad: 'Adjudicación',
    fechas: {
      inicioProgramado: '2025-02-01',
      terminoProgramado: '2025-05-30'
    },
    avance: {
      fisico: 20,
      financiero: 25,
      actualizadoEl: '2025-03-15'
    },
    estatus: 'En proceso',
    riesgo: 'Bajo',
    desviacionFinanciera: 5,
    diasAtraso: 0
  },
  {
    id: 'obra-012',
    ejercicio: 2024,
    clave: 'OP-2024-010',
    nombre: 'Rehabilitación de mercado municipal',
    localidad: 'Cabecera Municipal',
    fuente: 'Propios',
    rubro: 'Equipamiento urbano',
    montoProgramado: 4_750_000,
    montoContratado: 4_600_000,
    contratistaId: 'cont-003',
    modalidad: 'Licitación',
    fechas: {
      inicioProgramado: '2024-06-10',
      terminoProgramado: '2024-11-30'
    },
    avance: {
      fisico: 6,
      financiero: 8,
      actualizadoEl: '2024-07-01'
    },
    estatus: 'En proceso',
    riesgo: 'Bajo',
    desviacionFinanciera: 2,
    diasAtraso: 0
  },
  {
    id: 'obra-013',
    ejercicio: 2024,
    clave: 'OP-2024-011',
    nombre: 'Ampliación de red eléctrica Barrio Alto',
    localidad: 'Barrio Alto',
    fuente: 'Ramo33',
    rubro: 'Electrificación',
    montoProgramado: 1_600_000,
    montoContratado: 1_550_000,
    contratistaId: 'cont-001',
    modalidad: 'Invitación',
    fechas: {
      inicioProgramado: '2024-04-05',
      terminoProgramado: '2024-07-10',
      inicioReal: '2024-04-07'
    },
    avance: {
      fisico: 52,
      financiero: 56,
      actualizadoEl: '2024-05-25'
    },
    estatus: 'En proceso',
    riesgo: 'Medio',
    desviacionFinanciera: 4,
    diasAtraso: 4
  },
  {
    id: 'obra-014',
    ejercicio: 2025,
    clave: 'OP-2025-004',
    nombre: 'Construcción de aulas UEM San Pedro',
    localidad: 'San Pedro',
    fuente: 'FAISMUN',
    rubro: 'Infraestructura educativa',
    montoProgramado: 3_450_000,
    montoContratado: 3_390_000,
    contratistaId: 'cont-002',
    modalidad: 'Licitación',
    fechas: {
      inicioProgramado: '2025-03-01',
      terminoProgramado: '2025-08-15'
    },
    avance: {
      fisico: 15,
      financiero: 12,
      actualizadoEl: '2025-04-10'
    },
    estatus: 'En proceso',
    riesgo: 'Medio',
    desviacionFinanciera: -3,
    diasAtraso: 0
  },
  {
    id: 'obra-015',
    ejercicio: 2024,
    clave: 'OP-2024-012',
    nombre: 'Rehabilitación integral edificio histórico',
    localidad: 'Cabecera Municipal',
    fuente: 'Propios',
    rubro: 'Restauración',
    montoProgramado: 7_800_000,
    montoContratado: 7_500_000,
    contratistaId: 'cont-003',
    modalidad: 'Licitación',
    fechas: {
      inicioProgramado: '2024-02-01',
      terminoProgramado: '2024-12-20',
      inicioReal: '2024-02-05'
    },
    avance: {
      fisico: 35,
      financiero: 46,
      actualizadoEl: '2024-05-05'
    },
    estatus: 'En proceso',
    riesgo: 'Alto',
    desviacionFinanciera: 11,
    diasAtraso: 18
  }
];

const programas: ProgramaAnualItem[] = [
  {
    id: 'poa-2024-01',
    ejercicio: 2024,
    programa: 'Mejoramiento de vialidades rurales',
    fuente: 'FAISMUN',
    rubro: 'Infraestructura vial',
    localidad: 'San Miguel',
    montoProgramado: 4_500_000,
    beneficiarios: 3600,
    metaFisica: 'Rehabilitar 12 km de caminos rurales con carpeta asfáltica.',
    estatus: 'Publicado',
    auditoria: [
      { ts: '2024-01-05', user: 'Planeación', action: 'Captura inicial' },
      { ts: '2024-01-15', user: 'Cabildo', action: 'Aprobación POA' }
    ]
  },
  {
    id: 'poa-2024-02',
    ejercicio: 2024,
    programa: 'Infraestructura educativa digna',
    fuente: 'FAISMUN',
    rubro: 'Infraestructura educativa',
    localidad: 'San José',
    montoProgramado: 3_000_000,
    beneficiarios: 850,
    metaFisica: 'Construir y rehabilitar 4 planteles educativos.',
    estatus: 'En revisión',
    auditoria: [{ ts: '2024-02-01', user: 'Planeación', action: 'Turnado a comité de obra' }]
  },
  {
    id: 'poa-2024-03',
    ejercicio: 2024,
    programa: 'Alumbrado público eficiente',
    fuente: 'FORTAMUN',
    rubro: 'Servicios urbanos',
    localidad: 'Cabecera Municipal',
    montoProgramado: 3_200_000,
    beneficiarios: 12500,
    metaFisica: 'Modernizar 1,250 luminarias con tecnología LED.',
    estatus: 'Publicado',
    auditoria: [{ ts: '2024-01-25', user: 'Planeación', action: 'Programa cargado en sistema' }]
  },
  {
    id: 'poa-2025-01',
    ejercicio: 2025,
    programa: 'Obras de agua potable y saneamiento',
    fuente: 'Ramo33',
    rubro: 'Agua potable',
    localidad: 'La Esperanza',
    montoProgramado: 4_100_000,
    beneficiarios: 4200,
    metaFisica: 'Rehabilitar dos pozos y ampliar redes de conducción.',
    estatus: 'Planeado',
    auditoria: []
  },
  {
    id: 'poa-2025-02',
    ejercicio: 2025,
    programa: 'Equipamiento comunitario',
    fuente: 'Propios',
    rubro: 'Infraestructura social',
    localidad: 'El Rosario',
    montoProgramado: 5_100_000,
    beneficiarios: 2100,
    metaFisica: 'Construir un centro comunitario multiusos.',
    estatus: 'Planeado',
    auditoria: []
  }
];

const randomAudit = (user: string, action: string) => [{ ts: dayjs().toISOString(), user, action }];

const estimaciones: Estimacion[] = [
  {
    id: 'est-obra-001-1',
    obraId: 'obra-001',
    periodo: { del: '2024-03-01', al: '2024-03-31', numero: 1 },
    importe: {
      directo: 980_000,
      indirecto: 95_000,
      utilidad: 82_000,
      anticipoAplicado: 120_000,
      retenciones: 52_000,
      deducciones: 18_000,
      subtotal: 967_000,
      iva: 154_720,
      total: 1_121_720
    },
    partidas: [
      { clave: 'PAV-01', descripcion: 'Terracerías', unidad: 'm2', cantidad: 3200, precioUnitario: 120, importe: 384_000 },
      { clave: 'PAV-02', descripcion: 'Base hidráulica', unidad: 'm3', cantidad: 1800, precioUnitario: 250, importe: 450_000 }
    ],
    estatus: 'Aprobada',
    auditoria: randomAudit('Supervisor de obra', 'Aprobación de estimación')
  },
  {
    id: 'est-obra-001-2',
    obraId: 'obra-001',
    periodo: { del: '2024-04-01', al: '2024-04-30', numero: 2 },
    importe: {
      directo: 820_000,
      indirecto: 80_000,
      utilidad: 70_000,
      anticipoAplicado: 120_000,
      retenciones: 41_000,
      deducciones: 12_000,
      subtotal: 797_000,
      iva: 127_520,
      total: 924_520
    },
    partidas: [
      { clave: 'PAV-03', descripcion: 'Carpeta asfáltica', unidad: 'm2', cantidad: 2500, precioUnitario: 180, importe: 450_000 }
    ],
    estatus: 'En revisión',
    auditoria: randomAudit('Residente', 'Enviada a revisión')
  },
  {
    id: 'est-obra-002-1',
    obraId: 'obra-002',
    periodo: { del: '2024-02-01', al: '2024-02-29', numero: 1 },
    importe: {
      directo: 560_000,
      indirecto: 50_000,
      utilidad: 45_000,
      anticipoAplicado: 80_000,
      retenciones: 22_000,
      deducciones: 8_000,
      subtotal: 545_000,
      iva: 87_200,
      total: 632_200
    },
    partidas: [
      { clave: 'LED-01', descripcion: 'Suministro luminarias LED', unidad: 'pza', cantidad: 450, precioUnitario: 900, importe: 405_000 }
    ],
    estatus: 'Enviada a Tesorería',
    auditoria: randomAudit('Director de Obras', 'Autorizada para pago')
  },
  {
    id: 'est-obra-003-1',
    obraId: 'obra-003',
    periodo: { del: '2024-04-01', al: '2024-04-30', numero: 1 },
    importe: {
      directo: 1_050_000,
      indirecto: 110_000,
      utilidad: 96_000,
      anticipoAplicado: 160_000,
      retenciones: 58_000,
      deducciones: 20_000,
      subtotal: 1_018_000,
      iva: 162_880,
      total: 1_180_880
    },
    partidas: [
      { clave: 'PAV-05', descripcion: 'Colado de losas', unidad: 'm3', cantidad: 1450, precioUnitario: 320, importe: 464_000 }
    ],
    estatus: 'Aprobada',
    auditoria: randomAudit('Supervisión externa', 'Conformidad de estimación')
  },
  {
    id: 'est-obra-007-1',
    obraId: 'obra-007',
    periodo: { del: '2024-05-01', al: '2024-05-31', numero: 1 },
    importe: {
      directo: 430_000,
      indirecto: 40_000,
      utilidad: 35_000,
      anticipoAplicado: 60_000,
      retenciones: 21_000,
      deducciones: 9_000,
      subtotal: 415_000,
      iva: 66_400,
      total: 481_400
    },
    partidas: [
      { clave: 'DRE-02', descripcion: 'Tubería PVC 12"', unidad: 'm', cantidad: 600, precioUnitario: 320, importe: 192_000 }
    ],
    estatus: 'Borrador',
    auditoria: []
  },
  {
    id: 'est-obra-008-1',
    obraId: 'obra-008',
    periodo: { del: '2024-04-01', al: '2024-04-30', numero: 1 },
    importe: {
      directo: 310_000,
      indirecto: 28_000,
      utilidad: 25_000,
      anticipoAplicado: 45_000,
      retenciones: 15_000,
      deducciones: 6_000,
      subtotal: 297_000,
      iva: 47_520,
      total: 344_520
    },
    partidas: [
      { clave: 'AG-04', descripcion: 'Excavación y relleno', unidad: 'm3', cantidad: 980, precioUnitario: 150, importe: 147_000 }
    ],
    estatus: 'Aprobada',
    auditoria: randomAudit('Supervisor hidráulico', 'Acta de conformidad emitida')
  },
  {
    id: 'est-obra-012-1',
    obraId: 'obra-012',
    periodo: { del: '2024-07-01', al: '2024-07-31', numero: 1 },
    importe: {
      directo: 580_000,
      indirecto: 55_000,
      utilidad: 48_000,
      anticipoAplicado: 80_000,
      retenciones: 26_000,
      deducciones: 10_000,
      subtotal: 567_000,
      iva: 90_720,
      total: 657_720
    },
    partidas: [
      { clave: 'ACAB-01', descripcion: 'Restauración de fachada histórica', unidad: 'm2', cantidad: 600, precioUnitario: 880, importe: 528_000 }
    ],
    estatus: 'Borrador',
    auditoria: []
  },
  {
    id: 'est-obra-003-2',
    obraId: 'obra-003',
    periodo: { del: '2024-05-01', al: '2024-05-31', numero: 2 },
    importe: {
      directo: 890_000,
      indirecto: 90_000,
      utilidad: 80_000,
      anticipoAplicado: 160_000,
      retenciones: 54_000,
      deducciones: 21_000,
      subtotal: 825_000,
      iva: 132_000,
      total: 957_000
    },
    partidas: [
      { clave: 'PAV-05', descripcion: 'Colado de losas', unidad: 'm3', cantidad: 1300, precioUnitario: 340, importe: 442_000 }
    ],
    estatus: 'En revisión',
    auditoria: randomAudit('Residente', 'Captura de estimación 2')
  },
  {
    id: 'est-obra-005-1',
    obraId: 'obra-005',
    periodo: { del: '2024-03-01', al: '2024-03-31', numero: 1 },
    importe: {
      directo: 260_000,
      indirecto: 24_000,
      utilidad: 20_000,
      anticipoAplicado: 35_000,
      retenciones: 9_000,
      deducciones: 5_000,
      subtotal: 255_000,
      iva: 40_800,
      total: 295_800
    },
    partidas: [
      { clave: 'ESC-01', descripcion: 'Estructura metálica techumbre', unidad: 'm2', cantidad: 420, precioUnitario: 450, importe: 189_000 }
    ],
    estatus: 'Aprobada',
    auditoria: randomAudit('Director de Obras', 'Estimación autorizada')
  },
  {
    id: 'est-obra-008-2',
    obraId: 'obra-008',
    periodo: { del: '2024-05-01', al: '2024-05-31', numero: 2 },
    importe: {
      directo: 295_000,
      indirecto: 27_000,
      utilidad: 23_000,
      anticipoAplicado: 45_000,
      retenciones: 14_000,
      deducciones: 5_000,
      subtotal: 281_000,
      iva: 44_960,
      total: 325_960
    },
    partidas: [
      { clave: 'AG-05', descripcion: 'Instalación de tomas domiciliarias', unidad: 'pza', cantidad: 180, precioUnitario: 950, importe: 171_000 }
    ],
    estatus: 'Enviada a Tesorería',
    auditoria: randomAudit('Dirección de Tesorería', 'Recepción de estimación')
  },
  {
    id: 'est-obra-004-1',
    obraId: 'obra-004',
    periodo: { del: '2025-02-01', al: '2025-02-28', numero: 1 },
    importe: {
      directo: 320_000,
      indirecto: 30_000,
      utilidad: 26_000,
      anticipoAplicado: 40_000,
      retenciones: 12_000,
      deducciones: 4_000,
      subtotal: 320_000,
      iva: 51_200,
      total: 371_200
    },
    partidas: [
      { clave: 'POZ-01', descripcion: 'Equipamiento electromecánico', unidad: 'pza', cantidad: 1, precioUnitario: 210_000, importe: 210_000 }
    ],
    estatus: 'Borrador',
    auditoria: []
  }
];

const bitacora: BitacoraEntrada[] = Array.from({ length: 30 }).map((_, index) => {
  const obra = obras[index % obras.length];
  return {
    id: `bit-${index + 1}`,
    obraId: obra.id,
    fecha: dayjs(obra.fechas.inicioProgramado ?? '2024-01-01').add(index, 'day').format('YYYY-MM-DD'),
    descripcion:
      index % 3 === 0
        ? 'Verificación de avance conforme al cronograma programado.'
        : index % 3 === 1
        ? 'Se documenta entrega de materiales y supervisión de calidad.'
        : 'Se registran condiciones climáticas adversas que retrasaron trabajos.',
    tipo: index % 3 === 0 ? 'Residente' : index % 3 === 1 ? 'Supervisión' : 'Observación',
    responsable: index % 3 === 0 ? 'Residente de obra' : index % 3 === 1 ? 'Supervisor externo' : 'Contraloría'
  } as BitacoraEntrada;
});

const expedientes: ExpedienteDocumento[] = Array.from({ length: 20 }).map((_, index) => {
  const obra = obras[index % obras.length];
  const tipos = requiredDocsCycle();
  return {
    id: `doc-${index + 1}`,
    obraId: obra.id,
    tipo: tipos[index % tipos.length],
    version: (index % 2) + 1,
    fecha: dayjs(obra.fechas.inicioProgramado ?? '2024-01-15').add(index * 3, 'day').format('YYYY-MM-DD'),
    responsable: index % 2 === 0 ? 'Residente de obra' : 'Dirección de Proyectos',
    archivo: {
      nombre: `${tipos[index % tipos.length].toLowerCase().replace(/\s+/g, '-')}-v${(index % 2) + 1}.pdf`,
      tipo: 'application/pdf',
      tamano: 2_048_000
    },
    comentarios: index % 2 === 0 ? 'Documento revisado por supervisión.' : undefined
  };
});

function requiredDocsCycle() {
  return [
    'Estudio socioeconómico',
    'Catálogo de conceptos',
    'Planos arquitectónicos',
    'Especificaciones técnicas',
    'Presupuesto base',
    'Bitácora de obra',
    'Programa de ejecución',
    'Programa de suministros',
    'Actas administrativas',
    'Evidencia fotográfica'
  ];
}

const contratos: ContratoProcedimiento[] = obras.slice(0, 8).map((obra, idx) => ({
  id: `contrato-${obra.id}`,
  obraId: obra.id,
  modalidad: obra.modalidad ?? 'Licitación',
  descripcion: `Contrato principal para ${obra.nombre.toLowerCase()}`,
  fechas: {
    convocatoria: dayjs(obra.fechas.inicioProgramado ?? '2024-01-01').subtract(30, 'day').format('YYYY-MM-DD'),
    juntaAclaraciones: dayjs(obra.fechas.inicioProgramado ?? '2024-01-01').subtract(20, 'day').format('YYYY-MM-DD'),
    fallo: dayjs(obra.fechas.inicioProgramado ?? '2024-01-01').subtract(10, 'day').format('YYYY-MM-DD'),
    firma: dayjs(obra.fechas.inicioProgramado ?? '2024-01-01').subtract(5, 'day').format('YYYY-MM-DD')
  },
  contratistaId: obra.contratistaId ?? contratistas[idx % contratistas.length].id,
  monto: obra.montoContratado,
  anticipo: 10,
  plazos: {
    inicio: obra.fechas.inicioProgramado ?? '2024-01-15',
    termino: obra.fechas.terminoProgramado ?? '2024-12-31'
  },
  garantias: ['Fianza de cumplimiento 10%', 'Póliza de vicios ocultos'],
  penasConvencionales: '0.5% del monto por día natural de retraso',
  documentos: [
    { id: `doc-contrato-${obra.id}`, nombre: `Contrato_${obra.clave}.pdf`, tipo: 'application/pdf' }
  ],
  auditoria: randomAudit('Comité de obra', 'Procedimiento registrado')
}));

const avances: AvanceCurvaS[] = obras.slice(0, 10).flatMap((obra) =>
  Array.from({ length: 6 }).map((_, index) => ({
    id: `avance-${obra.id}-${index + 1}`,
    obraId: obra.id,
    corte: dayjs(obra.fechas.inicioProgramado ?? '2024-01-01').add(index + 1, 'month').format('YYYY-MM-DD'),
    fisicoProgramado: Math.min(100, (index + 1) * 15),
    fisicoReal: Math.min(100, (obra.avance.fisico - 5) + index * 8 + (index % 2 === 0 ? 2 : -3)),
    financieroProgramado: Math.min(100, (index + 1) * 17),
    financieroReal: Math.min(100, (obra.avance.financiero - 6) + index * 9),
    comentarios:
      index === 0
        ? 'Arranque de obra con recursos preliminares.'
        : index === 3
        ? 'Se detectó desviación, se reforzó cuadrilla de trabajo.'
        : undefined
  }))
);

const actas: Acta[] = [
  {
    id: 'acta-obra-001-inicio',
    obraId: 'obra-001',
    tipo: 'Inicio',
    folio: 'ACT-IN-001/2024',
    fecha: '2024-02-05',
    estatus: 'Firmada',
    version: 1,
    participantes: ['Presidente Municipal', 'Director de Obras', 'Contratista'],
    auditoria: randomAudit('Contraloría', 'Registro de acta de inicio')
  },
  {
    id: 'acta-obra-002-entrega',
    obraId: 'obra-002',
    tipo: 'Entrega-Recepción',
    folio: 'ACT-ER-004/2024',
    fecha: '2024-04-12',
    estatus: 'Cerrada',
    version: 1,
    participantes: ['Director de Servicios Públicos', 'Contratista', 'Comité de obra'],
    auditoria: randomAudit('Contraloría', 'Cierre de acta de entrega')
  },
  {
    id: 'acta-obra-015-susp',
    obraId: 'obra-015',
    tipo: 'Suspensión',
    folio: 'ACT-SU-012/2024',
    fecha: '2024-05-15',
    estatus: 'Borrador',
    version: 1,
    participantes: ['Dirección de Obras', 'Supervisión externa'],
    auditoria: []
  }
];

const reportes: ReportePlantilla[] = [
  {
    id: 'rep-01',
    nombre: 'Listado de obras por fuente',
    descripcion: 'Resumen de obras agrupadas por fuente de financiamiento.',
    formatos: ['PDF', 'XLSX'],
    ultimaGeneracion: '2024-05-10 09:15'
  },
  {
    id: 'rep-02',
    nombre: 'Estado de estimaciones',
    descripcion: 'Detalle de estimaciones por obra y su estatus actual.',
    formatos: ['PDF', 'XLSX', 'JSON'],
    ultimaGeneracion: '2024-05-08 08:20'
  },
  {
    id: 'rep-03',
    nombre: 'Contratos por modalidad',
    descripcion: 'Relación de contratos activos clasificados por modalidad.',
    formatos: ['PDF', 'XLSX']
  },
  {
    id: 'rep-04',
    nombre: 'Avance físico-financiero por localidad',
    descripcion: 'Balance de avances y desviaciones por cada localidad.',
    formatos: ['XLSX', 'XML']
  },
  {
    id: 'rep-05',
    nombre: 'Obras con riesgo',
    descripcion: 'Listado de obras con semáforo amarillo o rojo.',
    formatos: ['PDF']
  },
  {
    id: 'rep-06',
    nombre: 'Expediente técnico incompleto',
    descripcion: 'Relación de obras con documentos faltantes para cierre.',
    formatos: ['PDF', 'XLSX']
  }
];

const configuracion: ConfiguracionObras = {
  fuentes: ['FAISMUN', 'FORTAMUN', 'Ramo33', 'Ramo28', 'Propios'],
  localidades: ['San Miguel', 'Cabecera Municipal', 'Colonia Hidalgo', 'La Esperanza', 'San José', 'El Rosario', 'Colonia Juárez', 'Rancho Nuevo', 'La Loma', 'Barrio Alto', 'San Rafael'],
  rubros: [
    'Infraestructura vial',
    'Servicios urbanos',
    'Pavimentación',
    'Agua potable',
    'Infraestructura educativa',
    'Infraestructura social',
    'Drenaje y saneamiento',
    'Espacios públicos',
    'Electrificación',
    'Restauración'
  ],
  modalidades: ['Licitación', 'Invitación', 'Adjudicación'],
  unidades: ['m', 'm2', 'm3', 'pza', 'Global'],
  contratistas,
  reglas: {
    umbralRetrasoDias: 10,
    umbralDesviacion: 5,
    formatoNumeracion: 'ACT-2024-###'
  },
  integraciones: {
    tesoreria: {
      compromisosLectura: true,
      preFoliosEnvio: true
    }
  }
};

export const publicWorksSeeds = {
  obras,
  programas,
  estimaciones,
  bitacora,
  expedientes,
  contratos,
  avances,
  actas,
  reportes,
  configuracion
};

