import { asClass } from 'awilix';
import {
  EmpresasUsuariosService,
  GetEmpresasByUsuario,
  SelectEmpresa,
} from './Application';
import { EmpresasUsuariosController } from './Infrastructure/Controllers';
import { EmpresasUsuariosRepositoryImplementation } from './Infrastructure/Database';
import { container } from '@server/Infrastructure/di/Container';

export const empresasUsuariosApp = {
  empresasUsuariosRepository: asClass(EmpresasUsuariosRepositoryImplementation),
  empresasUsuariosService: asClass(EmpresasUsuariosService),
  empresasUsuariosController: asClass(EmpresasUsuariosController),
  _getEmpresasByUsuario: asClass(GetEmpresasByUsuario),
  _selectEmpresa: asClass(SelectEmpresa),
};

export const empresasUsuariosController = () =>
  container.resolve<EmpresasUsuariosController>('empresasUsuariosController');
