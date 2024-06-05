import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5500;

app.get('/', (_req: Request, res: Response) => {
  res.send('Express + TypeScript Server 😁');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
