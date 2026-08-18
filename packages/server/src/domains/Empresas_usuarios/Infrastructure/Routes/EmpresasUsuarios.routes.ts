import { empresasUsuariosController } from '../../empresasUsuarios.di';

export const EmpresasUsuariosRoutes = () => {
  const { getByUsuario, selectEmpresa } = empresasUsuariosController();

  return {
    empresasUsuarios: {
      getByUsuario: getByUsuario(),
      selectEmpresa: selectEmpresa(),
    },
  };
};
