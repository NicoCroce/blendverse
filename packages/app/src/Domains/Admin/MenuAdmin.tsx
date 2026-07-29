import { DASHBOARD_ACCESS, MenuItem } from '@app/Application';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import {
  ADMIN_DASHBOARD,
  DOCUMENTS_DASHBOARD,
  LICENSES_DASHBOARD,
  EMPLEADOS_DASHBOARD,
  SEGMENTS_DASHBOARD,
  USER_SEGMENTS_DASHBOARD,
} from './Admin.routes';

export const MenuDashboard = () => (
  <MenuItem
    to={ADMIN_DASHBOARD}
    text="Administrar"
    icon={faChartLine}
    permission={DASHBOARD_ACCESS}
    redirect={DOCUMENTS_DASHBOARD}
  >
    <MenuItem
      to={DOCUMENTS_DASHBOARD}
      text="Documentos"
      permission={DASHBOARD_ACCESS}
    />
    <MenuItem
      to={LICENSES_DASHBOARD}
      text="Licencias"
      permission={DASHBOARD_ACCESS}
    />
    <MenuItem
      to={EMPLEADOS_DASHBOARD}
      text="Empleados"
      permission={DASHBOARD_ACCESS}
    />
    <MenuItem
      to={SEGMENTS_DASHBOARD}
      text="Gestionar Segmentos"
      permission={DASHBOARD_ACCESS}
    />
    <MenuItem
      to={USER_SEGMENTS_DASHBOARD}
      text="Segmentos a usuarios"
      permission={DASHBOARD_ACCESS}
    />
  </MenuItem>
);
