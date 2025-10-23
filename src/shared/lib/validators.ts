import dayjs from 'dayjs';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
const partidaRegex = /^\d{4,5}$/;

export const validateUUID = (value?: string) => {
  if (!value) return true;
  return uuidRegex.test(value) || 'El UUID no tiene un formato válido.';
};

export const validateRFC = (value: string) => {
  if (!value) return 'El RFC es obligatorio.';
  return rfcRegex.test(value.toUpperCase()) || 'El RFC no cumple con el formato oficial.';
};

export const validatePositiveAmount = (value: number) => {
  if (Number.isNaN(value)) return 'El importe es obligatorio.';
  if (value <= 0) return 'El importe debe ser mayor a 0.00.';
  const decimals = value.toString().split('.')[1];
  if (decimals && decimals.length > 2) return 'El importe solo permite dos decimales.';
  return true;
};

export const validateNonFutureDate = (value: string) => {
  if (!value) return 'La fecha es obligatoria.';
  const date = dayjs(value);
  if (!date.isValid()) return 'La fecha es inválida.';
  if (date.isAfter(dayjs(), 'day')) return 'La fecha no puede ser futura.';
  return true;
};

export const validatePartida = (partida: string) => {
  if (!partida) return 'Seleccione una partida válida.';
  if (!partidaRegex.test(partida)) return 'La partida debe contener 4 o 5 dígitos.';
  return true;
};

export const validateCapituloPartida = (capitulo: string, partida: string) => {
  if (!capitulo || !partida) return 'Capítulo y partida son obligatorios.';
  if (!partida.startsWith(capitulo[0])) return 'La partida no corresponde al capítulo seleccionado.';
  return true;
};

const allowedExtensions = ['xml', 'pdf', 'jpg', 'jpeg', 'png', 'dwg', 'zip'];

export const validateFile = (file: File, maxSizeMB = 5) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !allowedExtensions.includes(extension)) {
    return 'Formato de archivo no permitido (solo XML, PDF, JPG, PNG, DWG o ZIP).';
  }
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return `El archivo supera el tamaño máximo permitido (${maxSizeMB} MB).`;
  }
  return true;
};
