import { userApp } from './Users';
import { authApp } from './Auth';
import { permissionsApp } from './Permissions';
import { ownersysApp } from './Ownersyss';
import { userprofileApp } from './Userprofiles';
import { themeApp } from './Themes';

export const registerDomains = () => ({
  ...ownersysApp,
  ...authApp,
  ...userApp,
  ...permissionsApp,
  ...userprofileApp,
  ...themeApp,
});
