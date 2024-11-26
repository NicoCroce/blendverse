import { container } from '@server/utils/Container';
import { userApp } from './Users';
import { authApp } from './Auth';
import { permissionsApp } from './Permissions';

export const registerDomains = () =>
  container.register({ ...authApp, ...userApp, ...permissionsApp });
