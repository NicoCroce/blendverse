import { AppError, IUseCase } from '@server/Application';
import { OwnersyssRepository, ICreateOwnersys, Ownersys } from '../../Domain';

export class CreateOwnersys implements IUseCase<Ownersys> {
  constructor(private readonly ownersyssRepository: OwnersyssRepository) {}

  async execute({ input, requestContext }: ICreateOwnersys): Promise<Ownersys> {
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
    const newOwnersys = Ownersys.create({
      denominacion,
      logo,
      id,
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

    // Guardar en repositorio y retornar el Ownersys creado
    const ownersys = await this.ownersyssRepository.create({
      ownersys: newOwnersys,
      requestContext,
    });
    if (!ownersys) {
      throw new AppError('No se puede Ingresar Registro');
    }
    return ownersys;
  }
}
