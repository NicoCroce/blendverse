import { LICENSES_ACCESS, MenuItem } from '@app/Application';
import { CERTIFICATES_ROUTES } from './Certificates.routes';
import { faFileContract } from '@fortawesome/free-solid-svg-icons';

export const MenuCertificates = () => (
  <MenuItem
    permission={LICENSES_ACCESS}
    to={CERTIFICATES_ROUTES}
    icon={faFileContract}
    text="Mis Licencias"
  />
);
