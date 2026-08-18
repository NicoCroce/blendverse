import { AdminRouter } from '@app/Domains/Admin';
import { AuthRouter } from '@app/Domains/Auth';
import { CertificatesRouter } from '@app/Domains/Certificates';
import { DocumentsRouter } from '@app/Domains/Documents/';
import { EmpresasUsuariosRouter } from '@app/Domains/EmpresasUsuarios';
import { UsersRouter } from '@app/Domains/Users';
import { CompanyEmailSettingsRouter } from '@app/Domains/CompanyEmailSettings';

export const AllRoutes = [
  AuthRouter,
  UsersRouter,
  DocumentsRouter,
  CertificatesRouter,
  AdminRouter,
  EmpresasUsuariosRouter,
  CompanyEmailSettingsRouter,
];
