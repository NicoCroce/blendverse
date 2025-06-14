import { userApp } from './Users';
import { authApp } from './Auth';
import { permissionsApp } from './Permissions';

export const registerDomains = () => ({
  ...authApp,
  ...userApp,
  ...permissionsApp,
});
