import { container } from '@server/utils/Container';
import { userApp } from './Users';
import { authApp } from './Auth';

export const registerDomains = () =>
  container.register({ ...authApp, ...userApp });
