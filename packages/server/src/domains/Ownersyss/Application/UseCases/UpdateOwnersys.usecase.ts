import { AppError, IUseCase } from '@server/Application';
import { OwnersyssRepository, IUpdateOwnersys, Ownersys } from '../../Domain';

export class UpdateOwnersys implements IUseCase<Ownersys> {
  constructor(private readonly ownersyssRepository: OwnersyssRepository) {}

  async execute({ input, requestContext }: IUpdateOwnersys): Promise<Ownersys> {
    const {
      id,
      denominacion,
      logo,
      razon_social,
      cuit,
      domicilio_fiscal,
      telefonos_principales,
      email_corporativo,
      horarios_atencion,
      whatsapp,
      sucursal_pedido = 0,
      sucursal_presupuestos = 0,
    } = input;
    const updOwnersys = Ownersys.create({
      id,
      denominacion,
      logo,
      razon_social,
      cuit,
      domicilio_fiscal,
      telefonos_principales,
      email_corporativo,
      horarios_atencion,
      whatsapp,
      sucursal_pedido,
      sucursal_presupuestos,
    });
    const idret = await this.ownersyssRepository.update({
      ownersys: updOwnersys,
      requestContext,
    });

    if (!idret) {
      throw new AppError('No se pudo Actualizar Registro');
    }
    return updOwnersys;
  }
}
