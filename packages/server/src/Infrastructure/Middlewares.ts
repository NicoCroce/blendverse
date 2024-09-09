import { Express } from 'express';
import cors from 'cors';
import { InstanceMainRouter } from './Routes/Router';
import cookieParser from 'cookie-parser';

export const initMiddlewares = (app: Express) => {
  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    }),
  );

  app.use(cookieParser());

  //** Routes */
  InstanceMainRouter(app);
};
