import { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import { logger } from '@server/Infrastructure/utils/pino';
import { v4 as uuidv4 } from 'uuid';
import { initExpress } from './Express/LoadFiles';

export const initMiddlewares = (app: Express) => {
  const allowedOrigins = (
    process.env.URL_CLIENT?.split(',').map((origin) => origin.trim()) || [
      'http://localhost:5173',
      'http://localhost:5174',
    ]
  ).filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`CORS origin not allowed: ${origin}`));
      },
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'x-app-client'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );

  app.use(cookieParser());

  initExpress(app);

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
      customSuccessMessage: function (req, res, responseTime) {
        const requestId = res.getHeader('requestId') as string;
        const statusCode = res.statusCode || res?.statusCode;
        if (statusCode && statusCode >= 400) {
          return `[${requestId}] => ${req.method} - ${decodeURIComponent(req.url)} - ${res.statusCode}`;
        }
        return `[${requestId}] => ${req.method} - ${decodeURIComponent(req.url)} - ${statusCode} (${responseTime}ms)`;
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
