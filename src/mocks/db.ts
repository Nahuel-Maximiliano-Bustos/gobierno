import {
  Compromiso,
  CuentaBancaria,
  Egreso,
  Ingreso,
  MovimientoBancario,
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
import { seeds } from './seeds';

export type MockDB = {
  ingresos: Ingreso[];
  egresos: Egreso[];
  compromisos: Compromiso[];
  presupuesto: Presupuesto;
  proveedores: Proveedor[];
  cuentas: CuentaBancaria[];
  movimientos: MovimientoBancario[];
  obras: Obra[];
  programas: ProgramaAnualItem[];
  estimacionesObra: Estimacion[];
  bitacoraObra: BitacoraEntrada[];
  expedientesObra: ExpedienteDocumento[];
  contratosObra: ContratoProcedimiento[];
  avancesObra: AvanceCurvaS[];
  actasObra: Acta[];
  reportesObra: ReportePlantilla[];
  configuracionObras: ConfiguracionObras;
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const ensureId = <T extends { id?: string }>(value: T) => ({
  ...value,
  id: value.id ?? crypto.randomUUID()
});

class Database {
  private state: MockDB;

  constructor() {
    this.state = this.seed();
  }

  private seed(): MockDB {
    return {
      ingresos: clone(seeds.ingresos),
      egresos: clone(seeds.egresos),
      compromisos: clone(seeds.compromisos),
      presupuesto: clone(seeds.presupuesto),
      proveedores: clone(seeds.proveedores),
      cuentas: clone(seeds.cuentas),
      movimientos: clone(seeds.movimientos),
      obras: clone(seeds.obras),
      programas: clone(seeds.programas),
      estimacionesObra: clone(seeds.estimacionesObra),
      bitacoraObra: clone(seeds.bitacoraObra),
      expedientesObra: clone(seeds.expedientesObra),
      contratosObra: clone(seeds.contratosObra),
      avancesObra: clone(seeds.avancesObra),
      actasObra: clone(seeds.actasObra),
      reportesObra: clone(seeds.reportesObra),
      configuracionObras: clone(seeds.configuracionObras)
    };
  }

  reset() {
    this.state = this.seed();
  }

  list<K extends keyof MockDB>(key: K): MockDB[K] {
    return clone(this.state[key]);
  }

  insert<K extends keyof MockDB>(key: K, item: MockDB[K] extends Array<infer U> ? U : never) {
    if (!Array.isArray(this.state[key])) {
      throw new Error(`Insert no soportado en ${String(key)}`);
    }
    const next = ensureId(item as any);
    (this.state[key] as Array<typeof next>).push(next);
    return clone(next);
  }

  find<K extends keyof MockDB>(key: K, id: string) {
    if (key === 'presupuesto') {
      const presupuesto = this.state.presupuesto;
      return presupuesto.id === id ? clone(presupuesto) : undefined;
    }
    if (key === 'configuracionObras') {
      return clone(this.state.configuracionObras);
    }
    const collection = this.state[key] as Array<any>;
    return clone(collection.find((record) => record.id === id));
  }

  update<K extends keyof MockDB>(key: K, id: string, patch: Partial<MockDB[K] extends Array<infer U> ? U : MockDB[K]>) {
    if (key === 'presupuesto') {
      this.state.presupuesto = { ...this.state.presupuesto, ...(patch as Partial<Presupuesto>) } as Presupuesto;
      return clone(this.state.presupuesto);
    }
    if (key === 'configuracionObras') {
      this.state.configuracionObras = {
        ...this.state.configuracionObras,
        ...(patch as Partial<ConfiguracionObras>)
      } as ConfiguracionObras;
      return clone(this.state.configuracionObras);
    }
    const collection = this.state[key] as Array<any>;
    const idx = collection.findIndex((record) => record.id === id);
    if (idx === -1) throw new Error('Registro no encontrado');
    const updated = { ...collection[idx], ...patch };
    collection[idx] = updated;
    return clone(updated);
  }

  delete<K extends keyof MockDB>(key: K, id: string) {
    if (!Array.isArray(this.state[key])) {
      throw new Error(`Delete no soportado en ${String(key)}`);
    }
    const collection = this.state[key] as Array<any>;
    const idx = collection.findIndex((record) => record.id === id);
    if (idx === -1) return false;
    collection.splice(idx, 1);
    return true;
  }
}

export const db = new Database();
