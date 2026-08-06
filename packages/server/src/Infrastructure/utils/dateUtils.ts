/**
 * Helpers de fechas para la capa de Infrastructure.
 * No dependen de Sequelize ni de ningún modelo: son funciones puras.
 */

export const formatDate = (date: Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const startOfToday = (): Date => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
};

export const endOfToday = (): Date => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end;
};

export const addDays = (from: Date, days: number): Date => {
  const result = new Date(from);
  result.setDate(result.getDate() + days);
  result.setHours(23, 59, 59, 999);
  return result;
};
