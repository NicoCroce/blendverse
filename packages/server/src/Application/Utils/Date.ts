import moment from 'moment';

export const normalizeDate = (date: Date | string): Date =>
  moment(date).toDate();

export const getDateString = (date: Date) =>
  new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
