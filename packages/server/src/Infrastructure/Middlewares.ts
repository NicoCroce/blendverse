import { Express } from 'express';
import cors from 'cors';
import { InstanceMainRouter } from './Routes/Router';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import { logger } from '@server/utils/pino';
import { v4 as uuidv4 } from 'uuid';

export const initMiddlewares = (app: Express) => {
  app.use(
    cors({
      origin: process.env.URL_CLIENT || 'http://localhost:5173',
      credentials: true,
    }),
  );

  app.use(cookieParser());

  app.use((_req, res, next) => {
    res.setHeader('requestId', uuidv4());
    res.setHeader('userId', '');
    next();
  });

  app.use(
    pinoHttp({
      logger,
      customLogLevel: (_req, res, err) => {
        const statusCode = res.statusCode || res?.statusCode;
        if (statusCode && statusCode >= 400) return 'error';
        if (err) return 'error';
        return 'info';
      },
      customSuccessMessage: function (req, res) {
        const requestId = res.getHeader('requestId') as string;
        const statusCode = res.statusCode || res?.statusCode;
        if (statusCode && statusCode >= 400) {
          return `[${requestId}] => ${req.method} - ${decodeURIComponent(req.url)} - ${res.statusCode}`;
        } else {
          return `[${requestId}] => ${req.method} - ${decodeURIComponent(req.url)} - ${res.statusCode}`;
        }
      },
      customErrorMessage: function (req, _res, err) {
        return `Exception: ${req.method} ${decodeURIComponent(req.url)} - ${err.message}`;
      },
      /* serializers: {
        // Dejar vacío para no incluir 'req' y 'res' en el log
        req: () => undefined,
        res: () => undefined,
      }, */
    }),
  );

  //** Routes */
  InstanceMainRouter(app);
};

/* customLogLevel: (res: Response, err?: Error) => {
  if (res.statusCode >= 400) return 'error';
  if (err) return 'error';
  return 'info';
},
customLogMessage: (req: Request, res: Response) => {
  const { method, url } = req;
  return `${method} ${url} ${res.statusCode}`;
}, */
