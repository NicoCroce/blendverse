import { userApp } from './Users';
import { authApp } from './Auth';
import { permissionsApp } from './Permissions';
import { documentsApp } from './Documents';
import { documentTypesApp } from './DocumentsTypes';
import { certificatesApp } from './Certificates';
import { ownersysApp } from './Ownersyss';
import { userprofileApp } from './Userprofiles';
import { themeApp } from './Themes';
import { empresasUsuariosApp } from './Empresas_usuarios';
import { disclaimerApp } from './Disclaimer';
import { segmentsApp } from './Segments';
import { dailyReportApp } from './DailyReport';

export const registerDomains = () => ({
  ...ownersysApp,
  ...authApp,
  ...userApp,
  ...permissionsApp,
  ...documentsApp,
  ...documentTypesApp,
  ...certificatesApp,
  ...userprofileApp,
  ...themeApp,
  ...empresasUsuariosApp,
  ...disclaimerApp,
  ...segmentsApp,
  ...dailyReportApp,
});
