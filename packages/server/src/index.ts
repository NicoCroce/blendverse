//require('module-alias/register');
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createContext, trpcExpress } from './trpc/TrpcInstance';
import { AppRouter } from './trpc/Routes';

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 5500;

app.use(cors());
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: AppRouter,
    createContext,
  }),
);

app.get('/', (_req: Request, res: Response) => {
  res.send('Express + TypeScript Server 😁');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
