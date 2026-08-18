import { MenuItem, useGlobalStore } from '@app/Application';
import { TUserLogged } from '../Users';
import { SELECCIONAR_EMPRESA_ROUTE } from './EmpresasUsuarios.routes';
import { useGetEmpresasByUsuario } from './Hooks';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

export const MenuEmpresasUsuarios = () => {
  const { data: dataUser } = useGlobalStore<TUserLogged>('dataUser');
  const { data: empresas = [] } = useGetEmpresasByUsuario(dataUser?.id ?? 0);

  const hasMultipleEmpresas = empresas && empresas.length > 1;

  if (!hasMultipleEmpresas) {
    return null;
  }

  return (
    <MenuItem
      to={SELECCIONAR_EMPRESA_ROUTE}
      icon={faExchangeAlt}
      text="Cambiar empresa"
    />
  );
};
