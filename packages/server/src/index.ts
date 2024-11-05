//require('module-alias/register');
import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Express, Response } from 'express';
import { initMiddlewares } from './Infrastructure/Middlewares';
import { registerDomains } from './domains/register';
import { InstanceMainRouter } from './Infrastructure/Routes/Router';

const app: Express = express();
const port = process.env.PORT || 5500;

registerDomains();
initMiddlewares(app);
//** Routes */
InstanceMainRouter(app);

app.get('/', (_req: Request, res: Response) => {
  res.send('Express + TypeScript Server 😁');
});

app.listen(port, () => {
  console.log(
    `\x1b[36m INFO: [server]: \x1b[0m Server is running at \x1b[32mhttp://localhost:${port}\x1b`,
  );
});
