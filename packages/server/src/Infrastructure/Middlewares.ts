import { Express } from 'express';
import cors from 'cors';
import { InstanceMainRouter } from './Routes/Router';
import cookieParser from 'cookie-parser';

export const initMiddlewares = (app: Express) => {
  app.use(cors({ credentials: true }));
  app.use(cookieParser());

  //** Routes */
  InstanceMainRouter(app);
};
