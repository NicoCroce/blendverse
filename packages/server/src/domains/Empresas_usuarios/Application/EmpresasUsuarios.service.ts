import { executeUseCase } from '@server/Application';
import { GetEmpresasByUsuario, SelectEmpresa } from './UseCases';
import {
  IGetEmpresasByUsuarioInput,
  IGetEmpresasByUsuarioOutput,
  ISelectEmpresaInput,
  ISelectEmpresaOutput,
} from './empresasUsuarios.types';

export class EmpresasUsuariosService {
  constructor(
    private readonly _getEmpresasByUsuario: GetEmpresasByUsuario,
    private readonly _selectEmpresa: SelectEmpresa,
  ) {}

  async getByUsuario({
    input,
    requestContext,
  }: IGetEmpresasByUsuarioInput): Promise<IGetEmpresasByUsuarioOutput | null> {
    return executeUseCase({
      useCase: this._getEmpresasByUsuario,
      input,
      requestContext,
    });
  }

  async selectEmpresa({
    input,
    requestContext,
  }: ISelectEmpresaInput): Promise<ISelectEmpresaOutput> {
    return executeUseCase({
      useCase: this._selectEmpresa,
      input,
      requestContext,
    });
  }
}
