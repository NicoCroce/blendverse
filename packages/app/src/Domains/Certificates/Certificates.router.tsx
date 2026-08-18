import { Route } from 'react-router-dom';
import {
  CERTIFICATES_ROUTES,
  CERTIFICATES_ROUTES_ADD,
} from './Certificates.routes';
import { AddCertificatePage, CertificateListPage } from './Pages';

export const CertificatesRouter = [
  <Route
    key="certificates-list"
    path={CERTIFICATES_ROUTES}
    element={<CertificateListPage />}
  />,
  <Route
    key="add-license"
    path={CERTIFICATES_ROUTES_ADD}
    element={<AddCertificatePage />}
  />,
];
