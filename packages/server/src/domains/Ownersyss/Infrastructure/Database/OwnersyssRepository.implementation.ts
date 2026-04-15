import { Op } from 'sequelize';
import {
  IDeleteOwnersysRepository,
  IGetOwnersysRepository,
  IGetOwnersyssRepository,
  ICreateOwnersysRepository,
  IUpdateOwnersysRepository,
  IUpdateThemeRepository,
  Ownersys,
  OwnersyssRepository,
  IGetOwnersyssRepositoryResponse,
  OwnersysSelect,
  IGetSelectOwnersysRepository,
  IGetOwnerThemeRepository,
} from '../../Domain';

import { OwnersysModel } from './Ownersys.model';
import { ISelect, TransformToSelect } from '@server/Application';
import { PaginationImplementation } from '@server/utils';

export class OwnersyssRepositoryImplementation implements OwnersyssRepository {
  async getAllOwnersyss({
    filters,
  }: IGetOwnersyssRepository): Promise<IGetOwnersyssRepositoryResponse> {
    const { limit, offset, createPaginatedResponse } =
      PaginationImplementation(filters);

    const whereClause: { [key: string]: unknown } = {};
    if (filters?.denominacion) {
      whereClause.denominacion = {
        [Op.substring]: filters?.denominacion,
      };
    }
    if (filters?.logo) {
      whereClause.logo = {
        [Op.substring]: filters?.logo,
      };
    }
    const { count, rows } = await OwnersysModel.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'denominacion',
        'logo',
        'razon_social',
        'cuit',
        'domicilio_fiscal',
        'telefonos_principales',
        'email_corporativo',
        'horarios_atencion',
        'whatsapp',
        'sucursal_pedido',
        'sucursal_presupuestos',
        'tema',
      ],
      where: whereClause,
    });
    const data = rows.map(
      ({
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
      }) =>
        Ownersys.create({
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
        }),
    );

    return createPaginatedResponse(data, count);
  }

  async getSelectOwnersys({
    filters,
  }: IGetSelectOwnersysRepository): Promise<ISelect[]> {
    const whereClause: { [key: string]: unknown } = {};
    if (filters?.denominacion) {
      whereClause.denominacion = {
        [Op.substring]: filters?.denominacion,
      };
    }
    const data = await OwnersysModel.findAll({
      attributes: [
        'id',
        'denominacion',
        'logo',
        'razon_social',
        'cuit',
        'domicilio_fiscal',
        'telefonos_principales',
        'email_corporativo',
        'horarios_atencion',
        'whatsapp',
        'sucursal_pedido',
        'sucursal_presupuestos',
      ],
      where: whereClause,
    });

    const ret = data.map(
      ({ id, denominacion }) => new OwnersysSelect(denominacion, id),
    );
    return TransformToSelect(ret, 'denominacion');
  }
  async create({
    ownersys,
  }: ICreateOwnersysRepository): Promise<Ownersys | null> {
    if (!ownersys) {
      return null;
    }
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
      sucursal_pedido,
      sucursal_presupuestos,
      tema,
    } = ownersys.values;
    const newOwnersys = await OwnersysModel.create({
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
    if (!newOwnersys) return null;
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

  async update({
    ownersys,
  }: IUpdateOwnersysRepository): Promise<number | null> {
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
      sucursal_pedido,
      sucursal_presupuestos,
      tema,
    } = ownersys.values;
    const rowsAffected = await OwnersysModel.update(
      {
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
      },
      { where: { id } },
    );

    if (!id || !rowsAffected[0]) return null;
    return id;
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

  async delete({ id }: IDeleteOwnersysRepository): Promise<number | null> {
    const rowsAffected = await OwnersysModel.destroy({ where: { id } });
    if (rowsAffected === 0) return null;
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
