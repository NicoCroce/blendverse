//require('module-alias/register');
import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import { initMiddlewares } from './Infrastructure/Middlewares';

const app: Express = express();
const port = process.env.PORT || 5500;

initMiddlewares(app);

app.get('/', (_req: Request, res: Response) => {
  res.send('Express + TypeScript Server 😁');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
