import {
  IUpdateThemeRepository,
  OwnersyssRepository,
  IGetOwnerThemeRepository,
  IGetOwnersysRepository,
  Ownersys,
} from '../../Domain';

import { OwnersysModel } from './Ownersys.model';

export class OwnersyssRepositoryImplementation implements OwnersyssRepository {
  async getOwnersys({ id }: IGetOwnersysRepository): Promise<Ownersys | null> {
    const ownersysFound = await OwnersysModel.findOne({ where: { id } });
    if (!ownersysFound) {
      return null;
    }
    const {
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
      tema,
    } = ownersysFound;
    return Ownersys.create({
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
      tema,
    });
  }
  async updateTheme({
    requestContext,
    tema,
  }: IUpdateThemeRepository): Promise<number | null> {
    const id = requestContext.values.ownerId;

    const rowsAffected = await OwnersysModel.update(
      { tema },
      { where: { id } },
    );
    if (!id || !rowsAffected[0]) return null;
    return id;
  }
  async getOwnerTheme({
    requestContext,
  }: IGetOwnerThemeRepository): Promise<number | null> {
    const id = requestContext.values.ownerId;

    const data = await OwnersysModel.findOne({ where: { id } });
    if (!data) return null;
    return data.tema ?? null;
  }
}
