import crypto from 'crypto';
import { Op } from 'sequelize';
import {
  DisclaimerAcceptance,
  DisclaimerRepository,
  IEmployeeRecord,
  IGetEmployeesByCompanyRepository,
  IGetPendingEmployeeIdsRepository,
  IGetSignatureStatusRepository,
  ISignDisclaimerRepository,
} from '../../Domain';
import { DisclaimerAcceptanceModel } from './DisclaimerAcceptance.model';
import { UserModel } from '@server/domains/Users/Infrastructure/Database/Users.model';
import { IPaginationResponse } from '@server/Application';
import { PaginationImplementation } from '@server/Infrastructure/utils/pagination';

export class DisclaimerRepositoryImplementation implements DisclaimerRepository {
  private computeHash(userId: number, timestamp: string): string {
    const secret = process.env.SECRET_KEY_BACK || 'default-secret';
    const payload = `${userId}:${timestamp}`;
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  async getStatus({
    userId,
    ownerId,
  }: IGetSignatureStatusRepository): Promise<DisclaimerAcceptance | null> {
    const record = await DisclaimerAcceptanceModel.findOne({
      where: {
        id_usuario: userId,
        id_empresa: ownerId,
      },
    });

    if (!record) return null;

    return DisclaimerAcceptance.create({
      id: record.id,
      id_usuario: record.id_usuario,
      id_empresa: record.id_empresa,
      hash_prueba: record.hash_prueba,
      ip: record.ip,
      user_agent: record.user_agent,
      timestamp: record.timestamp,
    });
  }

  async sign({
    userId,
    ownerId,
    hash,
    ip,
    userAgent,
    timestamp,
  }: ISignDisclaimerRepository): Promise<DisclaimerAcceptance> {
    const [record] = await DisclaimerAcceptanceModel.upsert({
      id_usuario: userId,
      id_empresa: ownerId,
      hash_prueba: hash,
      ip,
      user_agent: userAgent,
      timestamp,
    });

    return DisclaimerAcceptance.create({
      id: record.id,
      id_usuario: record.id_usuario,
      id_empresa: record.id_empresa,
      hash_prueba: record.hash_prueba,
      ip: record.ip,
      user_agent: record.user_agent,
      timestamp: record.timestamp,
    });
  }

  async getEmployeesByCompany({
    ownerId,
    search,
    page,
    limit,
  }: IGetEmployeesByCompanyRepository): Promise<
    IPaginationResponse<IEmployeeRecord[]>
  > {
    const whereClause: Record<string | symbol, unknown> = {};
    if (ownerId !== undefined) {
      whereClause.id_propietario = ownerId;
    }
    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { apellido: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { offset, createPaginatedResponse } = PaginationImplementation({
      page,
      limit,
    });

    const totalItems = await UserModel.count({ where: whereClause });

    const users = await UserModel.findAll({
      where: whereClause,
      attributes: ['id', 'nombre', 'apellido', 'email', 'renovar_clave'],
      include: [
        {
          model: DisclaimerAcceptanceModel,
          as: 'DisclaimerAcceptance',
          required: false,
          attributes: ['hash_prueba', 'timestamp'],
        },
      ],
      offset,
      limit: limit ? Number(limit) : undefined,
      order: [['apellido', 'ASC']],
    });

    const data = users.map((user: UserModel) => {
      const disclaimer =
        (
          user as unknown as {
            DisclaimerAcceptance?: typeof DisclaimerAcceptanceModel.prototype;
          }
        ).DisclaimerAcceptance || null;

      let estado_firma: 'Pendiente' | 'Firmado' | 'Corrupto' = 'Pendiente';

      if (disclaimer) {
        const expectedHash = this.computeHash(
          user.id,
          disclaimer.timestamp.toISOString(),
        );
        estado_firma =
          expectedHash === disclaimer.hash_prueba ? 'Firmado' : 'Corrupto';
      }

      return {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        renovar_clave: user.renovar_clave,
        estado_firma,
      };
    });

    return createPaginatedResponse(data, totalItems);
  }

  async getPendingEmployeeIds({
    ownerId,
  }: IGetPendingEmployeeIdsRepository): Promise<number[]> {
    const whereClause: Record<string, unknown> = {};
    if (ownerId !== undefined) {
      whereClause.id_propietario = ownerId;
    }

    const users = await UserModel.findAll({
      where: whereClause,
      attributes: ['id'],
    });

    const userIds = users.map((u: UserModel) => u.id);

    const signedRecords = await DisclaimerAcceptanceModel.findAll({
      where: {
        id_usuario: { [Op.in]: userIds },
      },
      attributes: ['id_usuario', 'hash_prueba', 'timestamp'],
    });

    const signedMap = new Map<number, boolean>();
    for (const record of signedRecords) {
      if (record.timestamp) {
        const expectedHash = this.computeHash(
          record.id_usuario,
          record.timestamp.toISOString(),
        );
        signedMap.set(record.id_usuario, expectedHash === record.hash_prueba);
      }
    }

    return userIds.filter(
      (uid: number) => !signedMap.has(uid) || !signedMap.get(uid),
    );
  }

  computeHashForTest(userId: number, timestamp: string): string {
    return this.computeHash(userId, timestamp);
  }
}
