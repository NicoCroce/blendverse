import { TiposSegmentosModel } from './TiposSegmentos.model';
import { UsuariosSegmentosModel } from './UsuariosSegmentos.model';
import { Op } from 'sequelize';
import {
  SegmentsRepository,
  SegmentType,
  IGetSegmentTypesRepository,
  ICreateSegmentTypeRepository,
  IUpdateSegmentTypeRepository,
  IDeleteSegmentTypeRepository,
  IGetUserSegmentsRepository,
  IAssignSegmentToUserRepository,
  IRemoveSegmentFromUserRepository,
  IGetUsersBySegmentsRepository,
} from '../../Domain';
import { ISegmentType } from '../../Domain/SegmentType.types';
import { TenantAwareRepository } from '@server/Infrastructure/Database/TenantAwareRepository';

export class SegmentsRepositoryImplementation
  extends TenantAwareRepository
  implements SegmentsRepository
{
  async getSegmentTypes({
    requestContext,
  }: IGetSegmentTypesRepository): Promise<SegmentType[]> {
    const ownerId = requestContext.values.ownerId;
    const segments = await TiposSegmentosModel.findAll({
      where: { id_propietario: ownerId },
    });

    return segments.map((s) =>
      SegmentType.create({
        id: s.id as number,
        nombre: s.nombre,
        id_propietario: s.id_propietario,
      }),
    );
  }

  async createSegmentType({
    nombre,
    requestContext,
  }: ICreateSegmentTypeRepository): Promise<SegmentType> {
    const ownerId = requestContext.values.ownerId;
    const segment = await this.tenantCreate(
      TiposSegmentosModel,
      { nombre },
      ownerId,
    );

    return SegmentType.create({
      id: segment.id as number,
      nombre: segment.nombre,
      id_propietario: segment.id_propietario,
    });
  }

  /**
   * Security: uses tenantUpdate which validates that the segment type
   * belongs to the calling ownerId before updating. Throws 404 if the
   * record does not exist or belongs to another tenant (IDOR prevention).
   */
  async updateSegmentType({
    id,
    nombre,
    requestContext,
  }: IUpdateSegmentTypeRepository): Promise<SegmentType> {
    const ownerId = requestContext.values.ownerId;
    const updated = await this.tenantUpdate(
      TiposSegmentosModel,
      id,
      { nombre },
      ownerId,
    );

    return SegmentType.create({
      id: updated.id as number,
      nombre: updated.nombre,
      id_propietario: updated.id_propietario,
    });
  }

  /**
   * Security: uses tenantDelete which validates that the segment type
   * belongs to the calling ownerId before deleting. Throws 404 if the
   * record does not exist or belongs to another tenant (IDOR prevention).
   */
  async deleteSegmentType({
    id,
    requestContext,
  }: IDeleteSegmentTypeRepository): Promise<void> {
    const ownerId = requestContext.values.ownerId;
    await this.tenantDelete(TiposSegmentosModel, id, ownerId);
  }

  async getUserSegments({
    userId,
  }: IGetUserSegmentsRepository): Promise<SegmentType[]> {
    const userSegments = await UsuariosSegmentosModel.findAll({
      where: { id_usuario: userId },
      include: [
        {
          model: TiposSegmentosModel,
          required: true,
        },
      ],
    });

    return userSegments.map((us) => {
      const tipoSegmento = us.get('TiposSegmentosModel') as ISegmentType;
      return SegmentType.create({
        id: tipoSegmento.id,
        nombre: tipoSegmento.nombre,
        id_propietario: tipoSegmento.id_propietario,
      });
    });
  }

  async assignSegmentToUser({
    userId,
    segmentId,
  }: IAssignSegmentToUserRepository): Promise<void> {
    await UsuariosSegmentosModel.create({
      id_usuario: userId,
      id_segmento: segmentId,
    });
  }

  async removeSegmentFromUser({
    userId,
    segmentId,
  }: IRemoveSegmentFromUserRepository): Promise<void> {
    await UsuariosSegmentosModel.destroy({
      where: { id_usuario: userId, id_segmento: segmentId },
    });
  }

  async getUsersBySegments({
    segmentIds,
  }: IGetUsersBySegmentsRepository): Promise<number[]> {
    const userSegments = await UsuariosSegmentosModel.findAll({
      where: { id_segmento: { [Op.in]: segmentIds } },
      attributes: ['id_usuario'],
    });

    return [...new Set(userSegments.map((us) => us.id_usuario))];
  }
}
