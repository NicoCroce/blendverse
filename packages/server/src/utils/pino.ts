import pino from 'pino';

export const logger = pino({
  level: 'info', // Define el nivel de logging: 'debug', 'info', 'warn', 'error'
  transport: {
    target: 'pino-pretty', // Para formato legible en la terminal
    options: {
      colorize: true, // Colorea la salida en la terminal
      ignore: 'pid,hostname',
    },
  },
});
