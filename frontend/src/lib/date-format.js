import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const toDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

export const formatDate = (value) => {
  const parsed = toDate(value);
  if (!parsed) return '-';
  return format(parsed, 'dd/MM/yyyy', { locale: tr });
};

export const formatDateTime = (value) => {
  const parsed = toDate(value);
  if (!parsed) return '-';
  return format(parsed, 'dd/MM/yyyy HH:mm', { locale: tr });
};

export const formatTime = (value) => {
  const parsed = toDate(value);
  if (!parsed) return '-';
  return format(parsed, 'HH:mm', { locale: tr });
};
