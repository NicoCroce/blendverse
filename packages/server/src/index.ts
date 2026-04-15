//require('module-alias/register');
import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Express, Response } from 'express';
import { initMiddlewares } from './Infrastructure/Middlewares';
import {
  initSequelize,
  connect,
  relateModels,
} from './Infrastructure/Database';

// Validación de variables de entorno críticas
const requiredEnvVars = ['URL_CLIENT', 'CORE_BASE_URL', 'SECRET_KEY'];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(
    `⚠️  ADVERTENCIA: Variables de entorno faltantes: ${missingVars.join(', ')}`,
  );
}

// Mostrar configuración al iniciar (útil para debug en producción)
console.log('\n📋 Configuración del servidor:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   URL_CLIENT: ${process.env.URL_CLIENT}`);
console.log(`   CORE_BASE_URL: ${process.env.CORE_BASE_URL}`);
console.log(`   PORT: ${process.env.PORT || 5500}\n`);

const app: Express = express();
const port = process.env.PORT || 5500;

initSequelize();

initMiddlewares(app);

// Lazy load DI registration and routes after initialization
(async () => {
  const { registerDI } = await import('./Infrastructure/di/register.js');
  const { InstanceMainRouter } = await import(
    './Infrastructure/Routes/Router.js'
  );

  registerDI(app);

  //** Routes */
  InstanceMainRouter(app);
  relateModels();
  connect();

  app.get('/', (_req: Request, res: Response) => {
    res.send('Express + TypeScript Server 😁');
  });

  app.listen(port, () => {
    console.log(
      `\x1b[36m INFO: [server]: \x1b[0m Server is running at \x1b[32mhttp://localhost:${port}\x1b`,
    );
  });
})();
