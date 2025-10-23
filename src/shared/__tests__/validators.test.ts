import { describe, expect, it } from 'vitest';
import { validateFile } from '../lib/validators';

const createFile = (name: string, sizeMB: number) =>
  ({
    name,
    size: sizeMB * 1024 * 1024
  }) as unknown as File;

describe('validateFile', () => {
  it('permite extensiones admitidas', () => {
    const pdf = createFile('expediente.pdf', 1);
    const dwg = createFile('plano.dwg', 1);
    expect(validateFile(pdf)).toBe(true);
    expect(validateFile(dwg, 10)).toBe(true);
  });

  it('rechaza extensiones no soportadas', () => {
    const exe = createFile('malware.exe', 1);
    expect(validateFile(exe)).toContain('Formato de archivo no permitido');
  });

  it('valida tamaño máximo', () => {
    const big = createFile('evidencia.zip', 6);
    expect(validateFile(big)).toContain('supera el tamaño máximo permitido');
  });
});
