import { Route } from 'react-router-dom';
import { SeleccionarEmpresaPage } from './Pages';
import { SELECCIONAR_EMPRESA_ROUTE } from './EmpresasUsuarios.routes';

export const EmpresasUsuariosRouter = [
  <Route
    key="seleccionar-empresa"
    path={SELECCIONAR_EMPRESA_ROUTE}
    element={<SeleccionarEmpresaPage />}
  />,
];
