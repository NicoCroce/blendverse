import { TRequestContext } from '@server/Application';
import pino, { Bindings } from 'pino';

const PINO_LEVEL = process.env.PINO_LEVEL || 'error';

const transport = {
  pipeline: [
    {
      target: 'pino-pretty', // must be installed separately
      options: {
        colorize: true, // Colorea la salida en la terminal
        ignore: 'pid,hostname',
      },
    },
    {
      level: 'debug',
      target: 'pino/file',
      options: { destination: './logs/pino/server.log', mkdir: true },
    },
  ],
};

export const logger = pino({
  level: PINO_LEVEL, // Define el nivel de logging: 'debug', 'info', 'warn', 'error'
  timestamp: pino.stdTimeFunctions.isoTime,
  transport,
});

export const loggerContext = (context: Bindings | undefined) =>
  context ? logger.child(context) : logger;

export const loggerContextInput = (
  requestContext: TRequestContext,
  input: unknown,
) => {
  return loggerContext({
    ...requestContext,
    input: JSON.stringify(input),
  });
};
