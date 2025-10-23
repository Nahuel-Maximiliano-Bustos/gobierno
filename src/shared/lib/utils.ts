import dayjs from 'dayjs';

export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);

export const formatDate = (value: string | Date) =>
  dayjs(value).format('DD/MM/YYYY');

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const downloadFile = (name: string, content: string, type = 'text/csv') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
