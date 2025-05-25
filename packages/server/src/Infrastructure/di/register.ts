import { registerDomains } from '@server/domains/register';
import { container } from '@server/utils/Container';
import { asValue } from 'awilix';
import { Express } from 'express';

export const registerDI = (app: Express) =>
  container.register({
    app: asValue(app),
    ...registerDomains(),
  });
