import { IUseCase } from '@server/Application';
import { generateToken } from '@server/Infrastructure';
import { IEmpresasUsuariosRepository } from '../../Domain/EmpresasUsuarios.repository';
import {
  ISelectEmpresaInput,
  ISelectEmpresaOutput,
} from '../empresasUsuarios.types';

export class SelectEmpresa implements IUseCase<ISelectEmpresaOutput> {
  constructor(
    private readonly empresasUsuariosRepository: IEmpresasUsuariosRepository,
  ) {}

  async execute({
    input,
    requestContext,
  }: ISelectEmpresaInput): Promise<ISelectEmpresaOutput> {
    const { userId } = requestContext.values;
    const { empresaId } = input;

    const belongs = await this.empresasUsuariosRepository.belongsToEmpresa(
      userId,
      empresaId,
    );

    if (!belongs) {
      throw new Error('No tenés acceso a esta empresa');
    }

    const token = generateToken({ id: userId, ownerId: empresaId });
    return { token, ownerId: empresaId };
  }
}
