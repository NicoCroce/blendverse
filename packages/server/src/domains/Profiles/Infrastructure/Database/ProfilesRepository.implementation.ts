import { Op } from 'sequelize';
import {
  IDeleteProfileRepository,
  IGetProfileRepository,
  IGetProfilesRepository,
  ICreateProfileRepository,
  IUpdateProfileRepository,
  Profile,
  ProfilesRepository,
  IGetProfilesRepositoryResponse,
  ProfileSelect,
  IGetSelectProfileRepository,
} from '../../Domain';

import { ProfileModel } from './Profile.model';
import { ISelect, TransformToSelect } from '@server/Application';
import { PaginationImplementation } from '@server/utils';

export class ProfilesRepositoryImplementation implements ProfilesRepository {
  async getAllProfiles({
    filters,
    requestContext,
  }: IGetProfilesRepository): Promise<IGetProfilesRepositoryResponse> {
    const { limit, offset, createPaginatedResponse } =
      PaginationImplementation(filters);

    const whereClause: { [key: string]: unknown } = {};
    const {
      values: { ownerId },
    } = requestContext;

    if (ownerId) {
      whereClause.id_propietario = ownerId;
    }
    if (filters?.denominacion) {
      whereClause.denominacion = {
        [Op.substring]: filters?.denominacion,
      };
    }
    const { count, rows } = await ProfileModel.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'id_propietario',
        'denominacion',
        'visualiza_stock',
        'prioridad_precio',
      ],
      where: whereClause,
    });
    const data = rows.map(
      ({
        id,
        id_propietario,
        denominacion,
        visualiza_stock,
        prioridad_precio,
      }) =>
        Profile.create({
          id,
          id_propietario,
          denominacion,
          visualiza_stock,
          prioridad_precio,
        }),
    );

    return createPaginatedResponse(data, count);
  }

  async getSelectProfile({
    filters,
    requestContext,
  }: IGetSelectProfileRepository): Promise<ISelect[]> {
    const whereClause: { [key: string]: unknown } = {};
    const {
      values: { ownerId },
    } = requestContext;

    if (ownerId) {
      whereClause.id_propietario = ownerId;
    }
    if (filters?.denominacion) {
      whereClause.denominacion = {
        [Op.substring]: filters?.denominacion,
      };
    }
    const data = await ProfileModel.findAll({
      attributes: ['id', 'denominacion'],
      where: whereClause,
    });

    const ret = data.map(
      ({ id, denominacion }) => new ProfileSelect(denominacion, id),
    );
    return TransformToSelect(ret, 'denominacion');
  }

  async create({
    profile,
    requestContext,
  }: ICreateProfileRepository): Promise<Profile | null> {
    const {
      values: { ownerId },
    } = requestContext;

    if (!profile) {
      return null;
    }
    const { id, denominacion, visualiza_stock, prioridad_precio } =
      profile.values;
    const newProfile = await ProfileModel.create({
      id,
      id_propietario: ownerId,
      denominacion,
      visualiza_stock,
      prioridad_precio,
    });
    if (!newProfile) return null;
    return Profile.create({
      id,
      id_propietario: ownerId,
      denominacion,
      visualiza_stock,
      prioridad_precio,
    });
  }

  async getProfile({ id }: IGetProfileRepository): Promise<Profile | null> {
    const profileFound = await ProfileModel.findOne({ where: { id } });
    if (!profileFound) {
      return null;
    }
    const { id_propietario, denominacion, visualiza_stock, prioridad_precio } =
      profileFound;
    return Profile.create({
      id,
      id_propietario,
      denominacion,
      visualiza_stock,
      prioridad_precio,
    });
  }

  async update({ profile }: IUpdateProfileRepository): Promise<number | null> {
    const {
      id,
      id_propietario,
      denominacion,
      visualiza_stock,
      prioridad_precio,
    } = profile.values;
    const rowsAffected = await ProfileModel.update(
      {
        id_propietario,
        denominacion,
        visualiza_stock,
        prioridad_precio,
      },
      { where: { id } },
    );

    if (!id || !rowsAffected[0]) return null;
    return id;
  }

  async delete({ id }: IDeleteProfileRepository): Promise<number | null> {
    const rowsAffected = await ProfileModel.destroy({ where: { id } });
    if (rowsAffected === 0) return null;
    return id;
  }
}
