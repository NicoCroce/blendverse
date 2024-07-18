import { Express } from 'express';
import cors from 'cors';
import { InstanceUserRouter } from '@server/domains/Users';
import { InstanceProductsRouter } from '@server/domains/Products/Infrastructure';

export const initMiddlewares = (app: Express) => {
  app.use(cors());

  //** Routes */
  InstanceUserRouter(app);
  InstanceProductsRouter(app);
};
