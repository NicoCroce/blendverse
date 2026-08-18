const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

const toLocalDateParts = (date: Date | string): [number, number, number] => {
  if (typeof date === 'string') {
    const match = date.match(DATE_ONLY_PATTERN);
    if (match) {
      const [, year, month, day] = match;
      return [Number(year), Number(month) - 1, Number(day)];
    }
  }

  const parsed = date instanceof Date ? date : new Date(date);
  return [parsed.getFullYear(), parsed.getMonth(), parsed.getDate()];
};

export const startOfDay = (date: Date | string): Date => {
  const [year, month, day] = toLocalDateParts(date);
  return new Date(year, month, day, 0, 0, 0, 0);
};

export const endOfDay = (date: Date | string): Date => {
  const [year, month, day] = toLocalDateParts(date);
  return new Date(year, month, day, 23, 59, 59, 999);
};

export const normalizeDate = (date: Date | string): Date => startOfDay(date);

export const normalizeEndDate = (date: Date | string): Date => endOfDay(date);

/** Parsea YYYY-MM-DD (o ISO) como fecha local al mediodía, sin desfase UTC. */
export const parseDateOnly = (date: Date | string): Date => {
  const [year, month, day] = toLocalDateParts(date);
  return new Date(year, month, day, 12, 0, 0, 0);
};

export const getDateString = (date: Date) =>
  new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
