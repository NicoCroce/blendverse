import {
  IDeleteUserprofileRepository,
  ICreateUserprofileRepository,
  IUpdateUserprofileRepository,
  Userprofile,
  UserprofilesRepository,
} from '../../Domain';
import { IRequestContext } from '@server/Application';

import { UserprofileModel } from './Userprofile.model';
import { UserModel } from '@server/domains/Users';
import { ProfileModel } from '@server/domains/Profiles';

export class UserprofilesRepositoryImplementation
  implements UserprofilesRepository
{
  async createUserprofile({
    userprofile,
  }: ICreateUserprofileRepository): Promise<Userprofile | null> {
    if (!userprofile) {
      return null;
    }
    const { id, id_usuario, id_perfil } = userprofile.values;
    const newUserprofile = await UserprofileModel.create({
      id: id ?? 0,
      id_usuario: id_usuario ?? 0,
      id_perfil: id_perfil ?? 0,
    });
    if (!newUserprofile) return null;
    return Userprofile.create({
      id: (newUserprofile.id as number) ?? 0,
      id_usuario: (newUserprofile.id_usuario as number) ?? 0,
      id_perfil: (newUserprofile.id_perfil as number) ?? 0,
    });
  }

  async updateUserprofile({
    userprofile,
  }: IUpdateUserprofileRepository): Promise<number | null> {
    const { id, id_usuario, id_perfil } = userprofile.values;
    const rowsAffected = await UserprofileModel.update(
      {
        id_usuario,
        id_perfil,
      },
      { where: { id } },
    );

    if (!id || !rowsAffected[0]) return null;
    return id;
  }

  async deleteUserprofile({
    id,
  }: IDeleteUserprofileRepository): Promise<number | null> {
    const rowsAffected = await UserprofileModel.destroy({ where: { id } });
    if (rowsAffected === 0) return null;
    return id;
  }

  async getAllProfilesByUser(
    params: IRequestContext,
  ): Promise<Userprofile[] | null> {
    const userId = params.requestContext.values.userId;
    const userprofiles = await UserprofileModel.findAll({
      where: { id_usuario: userId },
      attributes: ['id', 'id_usuario', 'id_perfil'],
      include: [
        { model: UserModel, attributes: ['nombre'], as: 'User' },
        {
          model: ProfileModel,
          attributes: ['denominacion', 'prioridad_precio'],
          as: 'Profile',
        },
      ],
    });

    if (!userprofiles || userprofiles.length === 0) {
      return null;
    }

    return userprofiles.map((row: UserprofileModel) => {
      const { id, id_usuario, id_perfil } = row.dataValues;
      const user = row.get('User') as unknown as { nombre: string } | undefined;
      const profile = row.get('Profile') as unknown as
        | { denominacion: string; prioridad_precio: number }
        | undefined;
      return Userprofile.create({
        id: (id as number) ?? 0,
        id_usuario: (id_usuario as number) ?? 0,
        id_perfil: (id_perfil as number) ?? 0,
        userName: (user?.nombre || '')?.toString() ?? '',
        profileName: (profile?.denominacion || '')?.toString() ?? '',
        prioridad_precio: profile?.prioridad_precio ?? 0,
      });
    });
  }
}
