import dayjs from 'dayjs';
import {
  Compromiso,
  CuentaBancaria,
  Egreso,
  Ingreso,
  MovimientoBancario,
  Presupuesto,
  Proveedor
} from '@treasury/types';
import { publicWorksSeeds } from './publicWorksSeeds';

const today = dayjs();

const proveedores: Proveedor[] = [
  {
    id: 'prov-001',
    nombre: 'Servicios Urbanos del Bajío',
    rfc: 'SUB920304AB1',
    email: 'contacto@sub.com.mx',
    telefono: '4771234567',
    direccion: 'Calle Hidalgo 200, Centro'
  },
  {
    id: 'prov-002',
    nombre: 'Energía y Luz MX',
    rfc: 'ELM850912CD2',
    email: 'facturacion@energia.mx',
    telefono: '5556789012',
    direccion: 'Av. Reforma 789, CDMX'
  },
  {
    id: 'prov-003',
    nombre: 'Construcciones del Centro',
    rfc: 'CDC930405EF3',
    email: 'ventas@cdc.com',
    telefono: '4437890123',
    direccion: 'Circuito Interior 300, Morelia'
  },
  {
    id: 'prov-004',
    nombre: 'Papelería La Oficina',
    rfc: 'PLO010101GH4',
    email: 'ventas@papoficina.mx',
    telefono: '4493456789',
    direccion: 'Av. Universidad 123, Aguascalientes'
  },
  {
    id: 'prov-005',
    nombre: 'Tecnologías Municipales SA',
    rfc: 'TMS980716IJ5',
    email: 'soporte@tmunicipales.mx',
    telefono: '5512345678',
    direccion: 'Insurgentes Sur 1600, CDMX'
  }
];

const cuentas: CuentaBancaria[] = [
  {
    id: 'CTA-001',
    banco: 'BBVA',
    clabe: '012345678901234567',
    moneda: 'MXN',
    nombre: 'Cuenta Recaudadora',
    saldo: 575_450.32
  },
  {
    id: 'CTA-002',
    banco: 'Santander',
    clabe: '014785236954123456',
    moneda: 'MXN',
    nombre: 'Participaciones Federales',
    saldo: 1_245_890.54
  },
  {
    id: 'CTA-003',
    banco: 'Banorte',
    clabe: '072691005284765432',
    moneda: 'MXN',
    nombre: 'Obra Pública Municipal',
    saldo: 980_120.0
  }
];

const ingresos: Ingreso[] = Array.from({ length: 12 }).map((_, idx) => {
  const fecha = today.subtract(idx, 'day');
  const importe = 15_000 + idx * 750;
  return {
    id: `ing-${idx + 1}`,
    fecha: fecha.format('YYYY-MM-DD'),
    concepto: idx % 2 === 0 ? 'Cobro de impuesto predial' : 'Derechos por licencias',
    importe,
    fuente: idx % 2 === 0 ? 'Predial' : 'Licencias',
    referencia: `REF-${1000 + idx}`,
    cuentaId: idx % 2 === 0 ? 'CTA-001' : 'CTA-002',
    partida: idx % 2 === 0 ? '11501' : '13202',
    capitulo: idx % 2 === 0 ? '1000' : '3000',
    bitacora: [
      {
        ts: fecha.hour(8).toISOString(),
        user: 'TESORERO',
        action: 'CAPTURADO'
      }
    ]
  };
});

const egresos: Egreso[] = Array.from({ length: 10 }).map((_, idx) => {
  const fecha = today.subtract(idx + 2, 'day');
  const proveedor = proveedores[idx % proveedores.length];
  const importe = 12_500 + idx * 1_250;
  return {
    id: `eg-${idx + 1}`,
    fecha: fecha.format('YYYY-MM-DD'),
    concepto: idx % 2 === 0 ? 'Pago de servicios básicos' : 'Adquisición de equipo',
    importe,
    proveedorId: proveedor.id,
    uuid: idx % 3 === 0 ? `9e3b0c0a-120${idx}-4d3b-87ab-1234567890ab` : undefined,
    cuentaId: idx % 2 === 0 ? 'CTA-002' : 'CTA-003',
    partida: idx % 2 === 0 ? '21301' : '33502',
    capitulo: idx % 2 === 0 ? '2000' : '3000',
    estatus: idx % 3 === 0 ? 'PAGADO' : 'PENDIENTE',
    refPago: idx % 3 === 0 ? `TR-${3000 + idx}` : undefined,
    bitacora: [
      {
        ts: fecha.hour(9).toISOString(),
        user: 'TESORERO',
        action: 'REGISTRADO'
      }
    ]
  };
});

const compromisos: Compromiso[] = Array.from({ length: 8 }).map((_, idx) => {
  const fechaDocumento = today.subtract(idx + 5, 'day');
  const proveedor = proveedores[idx % proveedores.length];
  const estatusSequence: Compromiso['estatus'][] = [
    'BORRADOR',
    'REVISION',
    'AUTORIZADO',
    'PAGADO',
    'CERRADO'
  ];
  const estatus = estatusSequence[Math.min(estatusSequence.length - 1, idx)];
  return {
    id: `comp-${idx + 1}`,
    proveedor,
    uuid: `1d84fa3${idx}-0b8a-4c4b-97ae-b0f9bfb6b4${idx}`,
    concepto: idx % 2 === 0 ? 'Adquisición de luminarias LED' : 'Mantenimiento preventivo a vehículos',
    importe: 45_000 + idx * 5_500,
    partida: idx % 2 === 0 ? '33501' : '21201',
    capitulo: idx % 2 === 0 ? '3000' : '2000',
    fechaDocumento: fechaDocumento.format('YYYY-MM-DD'),
    fechaProgramada: fechaDocumento.add(7, 'day').format('YYYY-MM-DD'),
    estatus,
    banco: idx % 2 === 0 ? 'BBVA' : 'Santander',
    refPago: idx > 2 ? `PAY-${idx + 100}` : undefined,
    adjuntos: [
      {
        id: `adj-${idx + 1}`,
        name: `comprobante-${idx + 1}.pdf`
      }
    ],
    bitacora: [
      {
        ts: fechaDocumento.toISOString(),
        user: 'TESORERO',
        action: 'CREADO'
      }
    ]
  };
});

const presupuesto: Presupuesto = {
  id: 'pres-2025',
  ejercicio: today.year(),
  actualizado: today.toISOString(),
  partidas: [
    { clave: '1000', capitulo: '1000', nombre: 'Servicios Personales', disponible: 2_500_000 },
    { clave: '2000', capitulo: '2000', nombre: 'Materiales y Suministros', disponible: 1_250_000 },
    { clave: '21301', capitulo: '2000', nombre: 'Energía eléctrica', disponible: 450_000 },
    { clave: '3000', capitulo: '3000', nombre: 'Servicios Generales', disponible: 1_800_000 },
    { clave: '33501', capitulo: '3000', nombre: 'Arrendamientos', disponible: 950_000 },
    { clave: '4000', capitulo: '4000', nombre: 'Transferencias y Subsidios', disponible: 600_000 }
  ]
};

const movimientos: MovimientoBancario[] = [
  {
    id: 'mov-001',
    cuentaId: 'CTA-001',
    fecha: today.subtract(1, 'day').format('YYYY-MM-DD'),
    concepto: 'DEPÓSITO PREDIAL',
    importe: 12_500,
    tipo: 'ABONO',
    ref: 'PDL-90812',
    conciliado: false
  },
  {
    id: 'mov-002',
    cuentaId: 'CTA-001',
    fecha: today.subtract(2, 'day').format('YYYY-MM-DD'),
    concepto: 'PAGO CFE',
    importe: -3_560.75,
    tipo: 'CARGO',
    ref: 'EG-77123',
    conciliado: false
  },
  {
    id: 'mov-003',
    cuentaId: 'CTA-002',
    fecha: today.subtract(3, 'day').format('YYYY-MM-DD'),
    concepto: 'PARTICIPACIONES FEDERALES',
    importe: 480_000,
    tipo: 'ABONO',
    ref: 'PART-SEP',
    conciliado: true
  }
];

export const seeds = {
  ingresos,
  egresos,
  compromisos,
  presupuesto,
  proveedores,
  cuentas,
  movimientos,
  obras: publicWorksSeeds.obras,
  programas: publicWorksSeeds.programas,
  estimacionesObra: publicWorksSeeds.estimaciones,
  bitacoraObra: publicWorksSeeds.bitacora,
  expedientesObra: publicWorksSeeds.expedientes,
  contratosObra: publicWorksSeeds.contratos,
  avancesObra: publicWorksSeeds.avances,
  actasObra: publicWorksSeeds.actas,
  reportesObra: publicWorksSeeds.reportes,
  configuracionObras: publicWorksSeeds.configuracion
};
