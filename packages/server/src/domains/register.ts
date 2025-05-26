import { userApp } from './Users';
import { authApp } from './Auth';
import { permissionsApp } from './Permissions';
import { streetApp } from './Streets';

export const registerDomains = () => ({
  ...authApp,
  ...userApp,
  ...permissionsApp,
  ...streetApp,
});
