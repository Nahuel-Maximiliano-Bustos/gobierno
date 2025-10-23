export type UUID = string;
export type EstatusCompromiso =
  | 'BORRADOR'
  | 'REVISION'
  | 'RECHAZADO'
  | 'AUTORIZADO'
  | 'PAGADO'
  | 'CERRADO';

export type Proveedor = {
  id: string;
  nombre: string;
  rfc: string;
  telefono?: string;
  email?: string;
  direccion?: string;
};

export type Ingreso = {
  id: string;
  fecha: string;
  concepto: string;
  importe: number;
  fuente: string;
  referencia?: string;
  cuentaId: string;
  partida: string;
  capitulo: string;
  bitacora: any[];
};

export type Egreso = {
  id: string;
  fecha: string;
  concepto: string;
  importe: number;
  proveedorId: string;
  uuid?: UUID;
  cuentaId: string;
  partida: string;
  capitulo: string;
  estatus: 'PENDIENTE' | 'PAGADO';
  refPago?: string;
  bitacora: any[];
};

export type Compromiso = {
  id: string;
  proveedor: Proveedor;
  uuid: UUID;
  concepto: string;
  importe: number;
  partida: string;
  capitulo: string;
  fechaDocumento: string;
  fechaProgramada: string;
  estatus: EstatusCompromiso;
  banco?: string;
  refPago?: string;
  adjuntos?: Array<{ id: string; name: string; url?: string }>;
  bitacora: Array<{
    ts: string;
    user: string;
    action: string;
    before?: any;
    after?: any;
  }>;
};

export type Partida = {
  clave: string;
  capitulo: string;
  nombre: string;
  disponible: number;
};

export type Presupuesto = {
  id: string;
  ejercicio: number;
  partidas: Partida[];
  actualizado: string;
};

export type CuentaBancaria = {
  id: string;
  banco: string;
  clabe: string;
  moneda: 'MXN';
  nombre: string;
  saldo: number;
};

export type MovimientoBancario = {
  id: string;
  cuentaId: string;
  fecha: string;
  concepto: string;
  importe: number;
  tipo: 'ABONO' | 'CARGO';
  ref?: string;
  conciliado: boolean;
};
