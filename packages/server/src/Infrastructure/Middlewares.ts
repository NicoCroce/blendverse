import { Express } from 'express';
import cors from 'cors';
import { InstanceMainRouter } from './Routes/Router';

export const initMiddlewares = (app: Express) => {
  app.use(cors());

  //** Routes */
  InstanceMainRouter(app);
};
