import { Express } from 'express';
import cors from 'cors';
import { InstanceUserRouter } from '@server/domains/Users';

export const initMiddlewares = (app: Express) => {
  app.use(cors());

  //** Routes */
  InstanceUserRouter(app);
};
