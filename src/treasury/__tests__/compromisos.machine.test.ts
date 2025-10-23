import { describe, expect, it } from 'vitest';
import { compromisoTransitions } from '@mocks/handlers';

const canTransition = (from: string, to: string) => (compromisoTransitions as any)[from]?.includes(to);

describe('Máquina de estados de Compromiso', () => {
  it('permite avanzar de BORRADOR a REVISION', () => {
    expect(canTransition('BORRADOR', 'REVISION')).toBe(true);
  });

  it('no permite aprobar directamente desde BORRADOR', () => {
    expect(canTransition('BORRADOR', 'AUTORIZADO')).toBe(false);
  });

  it('permite autorizar después de revisión', () => {
    expect(canTransition('REVISION', 'AUTORIZADO')).toBe(true);
  });

  it('permite rechazar en revisión pero no después de autorizado', () => {
    expect(canTransition('REVISION', 'RECHAZADO')).toBe(true);
    expect(canTransition('AUTORIZADO', 'RECHAZADO')).toBe(false);
  });

  it('solo permite cerrar después de pagado', () => {
    expect(canTransition('PAGADO', 'CERRADO')).toBe(true);
    expect(canTransition('AUTORIZADO', 'CERRADO')).toBe(false);
  });
});
