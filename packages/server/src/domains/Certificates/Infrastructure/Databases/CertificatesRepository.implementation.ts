import { UserModel } from '@server/domains/Users';
import { UsuariosSegmentosModel } from '@server/domains/Segments/Infrastructure/Database/UsuariosSegmentos.model';
import { TiposSegmentosModel } from '@server/domains/Segments/Infrastructure/Database/TiposSegmentos.model';
import {
  Certificate,
  CertificateRepository,
  ICountLicensesInProgressRepository,
  ICountPendingLicensesRepository,
  IEmployeeOnLeaveRecord,
  IExpiringLicenseRecord,
  IGetCertificatesRepository,
  IGetEmployeesOnLeaveTodayRepository,
  IGetExpiringLicensesRepository,
  IGetPendingLicensesRepository,
  IGetUpcomingVacationsRepository,
  IPendingLicenseRecord,
  IUpcomingVacationRecord,
} from '../../Domain';
import {
  IAddCertificateRepository,
  IAppendImagesRepository,
  IDeleteCertificateRepository,
  IGetAllCompanyCertificatesRepositoryResponse,
  IGetCertificateRepository,
  IGetMonthlyStatisticsCertificatesRepository,
  IGetMonthlyStatisticsCertificatesRepositoryResponse,
  IGetStatisticsCertificatesRepository,
  IGetStatisticsCertificatesRepositoryResponse,
  IUpdateCertificateStatusRepository,
} from '../../Domain/Certificate.respository';
import { CertificateTypes } from '../../Domain/CertificateTypes.entity';
import { CertificateStatus } from '../../Domain/Certificate.types';
import { CertificateModel } from './Certificates.model';
import { CertificatesTypesModel } from './CertificatesTypes.model';
import { CertificatesFilters } from './CertificatesFilters';
import { Op } from 'sequelize';
import {
  addDays,
  buildEmployeeName,
  employeeSegmentName,
  endOfToday,
  formatDate,
  sequelize,
  startOfToday,
} from '@server/Infrastructure';

export class CertificatesRepositoryImplementation implements CertificateRepository {
  async appendImages({
    requestContext: _,
    certificateId,
    files,
  }: IAppendImagesRepository): Promise<Certificate> {
    try {
      const certificate = await CertificateModel.findByPk(certificateId);

      if (!certificate) {
        throw new Error('Certificate not found');
      }

      const updatedFiles = [...(certificate.archivos || []), ...files];

      await certificate.update({ archivos: updatedFiles });

      const certificateType = await CertificatesTypesModel.findByPk(
        certificate.id_tipo_certificado,
      );

      if (!certificateType) {
        throw new Error('Certificate type not found');
      }

      return Certificate.create({
        id: certificate.id,
        startDate: certificate.fecha_inicio,
        endDate: certificate.fecha_fin,
        returnDate: certificate.fecha_reintegro,
        reason: certificate.motivo,
        type: CertificateTypes.create({
          id: certificateType.id,
          name: certificateType.denominacion,
        }),
        requiresRest: Boolean(certificate.requiere_reposo),
        status: certificate.estado,
        files: updatedFiles,
      });
    } catch (error) {
      console.error('Error appending images to certificate:', error);
      throw new Error('Failed to append images to certificate', {
        cause: error,
      });
    }
  }

  async getCertificates({
    filters,
    requestContext,
  }: IGetCertificatesRepository): Promise<Certificate[]> {
    const { whereConditionUsers, whereConditionCertificates } =
      CertificatesFilters(filters);
    const certificates = await CertificateModel.findAll({
      where: {
        id_usuario: requestContext.values.userId,
        ...whereConditionCertificates,
      },
      include: [
        {
          model: CertificatesTypesModel,
        },
        {
          model: UserModel,
          as: 'User',
          where: whereConditionUsers,
        },
      ],
    });

    return certificates.map((certificate) =>
      Certificate.create({
        id: certificate.id,
        startDate: certificate.fecha_inicio,
        endDate: certificate.fecha_fin,
        returnDate: certificate.fecha_reintegro,
        reason: certificate.motivo,
        type: CertificateTypes.create({
          id: certificate.CertificatesTypesModel.id,
          name: certificate.CertificatesTypesModel.denominacion,
        }),
        requiresRest: Boolean(certificate.requiere_reposo),
        status: certificate.estado,
        files: certificate.archivos,
      }),
    );
  }

  async getAllCompanyCertificates({
    filters,
    requestContext,
  }: IGetCertificatesRepository): Promise<
    IGetAllCompanyCertificatesRepositoryResponse[]
  > {
    const { whereConditionUsers, whereConditionCertificates } =
      CertificatesFilters(filters);

    const certificates = await CertificateModel.findAll({
      where: { ...whereConditionCertificates },
      include: [
        {
          model: UserModel,
          as: 'User',
          where: {
            id_propietario: requestContext.values.ownerId,
            ...whereConditionUsers,
          },
          attributes: ['id', 'nombre', 'apellido'], // Atributos necesarios para la agrupación y ordenación
        },
        {
          model: CertificatesTypesModel,
        },
      ],
      order: [
        [{ model: UserModel, as: 'User' }, 'nombre', 'ASC'],
        [{ model: UserModel, as: 'User' }, 'apellido', 'ASC'],
      ],
    });

    return certificates.map((certificate) => {
      const {
        id,
        fecha_inicio,
        fecha_fin,
        fecha_reintegro,
        motivo,
        archivos,
        id_usuario,
        requiere_reposo,
        estado,
        CertificatesTypesModel,
        User,
      } = certificate;

      return {
        id,
        startDate: fecha_inicio,
        endDate: fecha_fin,
        returnDate: fecha_reintegro,
        reason: motivo,
        type: CertificateTypes.create({
          id: CertificatesTypesModel.id,
          name: CertificatesTypesModel.denominacion,
        }),
        requiresRest: Boolean(requiere_reposo),
        status: estado,
        files: archivos,
        userId: id_usuario,
        userName: `${User.nombre} ${User.apellido}`,
      };
    });
  }

  async getCertificatesTypes({
    requestContext: _,
  }: IGetCertificatesRepository): Promise<CertificateTypes[]> {
    const certificatesTypes = await CertificatesTypesModel.findAll();

    return certificatesTypes.map((certificateType) =>
      CertificateTypes.create({
        id: certificateType.id,
        name: certificateType.denominacion,
        description: certificateType.descripcion,
        rest: Boolean(certificateType.reposo),
      }),
    );
  }

  async addCertificate({
    requestContext,
    certificate,
  }: IAddCertificateRepository): Promise<Certificate> {
    const {
      startDate,
      endDate,
      returnDate,
      type,
      reason,
      requiresRest,
      status,
    } = certificate.values;

    try {
      const existingCertificate = await CertificateModel.findOne({
        where: {
          id_usuario: requestContext.values.userId,
          [Op.or]: [
            // startDate está dentro del rango existente
            {
              fecha_inicio: { [Op.lte]: startDate },
              fecha_reintegro: { [Op.gte]: startDate },
            },
            // returnDate está dentro del rango existente
            {
              fecha_inicio: { [Op.lte]: returnDate },
              fecha_reintegro: { [Op.gte]: returnDate },
            },
            // El nuevo rango contiene completamente un rango existente
            {
              fecha_inicio: { [Op.gte]: startDate },
              fecha_reintegro: { [Op.lte]: returnDate },
            },
          ],
        },
      });

      if (existingCertificate) {
        throw new Error(
          'Ya existe una licencia con fechas que se solapan con las fechas proporcionadas',
        );
      }
      const {
        id,
        fecha_inicio,
        fecha_fin,
        fecha_reintegro,
        motivo,
        id_tipo_certificado,
        estado,
      } = await CertificateModel.create({
        fecha_inicio: startDate,
        fecha_fin: endDate,
        fecha_reintegro: returnDate,
        motivo: reason,
        requiere_reposo: requiresRest,
        estado: status ?? 'pendiente',
        id_tipo_certificado: type.values.id,
        id_usuario: requestContext.values.userId,
      });

      const certificateType =
        await CertificatesTypesModel.findByPk(id_tipo_certificado);

      if (!certificateType) {
        throw new Error('Tipo de certificado no encontrado');
      }

      return Certificate.create({
        id,
        startDate: fecha_inicio,
        endDate: fecha_fin,
        returnDate: fecha_reintegro,
        reason: motivo,
        type: CertificateTypes.create({
          id: certificateType.id,
          name: certificateType.denominacion,
        }),
        requiresRest: Boolean(requiresRest),
        status: estado,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message, { cause: error });
      } else {
        throw new Error('Error al insertar certificado', { cause: error });
      }
    }
  }

  async getStatisticsCertificates({
    requestContext,
  }: IGetStatisticsCertificatesRepository): Promise<IGetStatisticsCertificatesRepositoryResponse> {
    const ownerId = requestContext.values.ownerId;

    const includeOwner = {
      model: UserModel,
      as: 'User',
      required: true,
      where: {
        id_propietario: ownerId,
      },
    };

    const { whereConditionCertificates: activeCertificatesWhere } =
      CertificatesFilters({ date: new Date() });

    const totalCertificates = await CertificateModel.count({
      include: [includeOwner],
    });

    const activesCertificates = await CertificateModel.count({
      where: activeCertificatesWhere,
      include: [includeOwner],
    });

    const allCertificatesTypes = await CertificateModel.findAll({
      attributes: [
        'id_tipo_certificado',
        [sequelize.fn('COUNT', sequelize.col('CertificateModel.id')), 'count'], // Contar certificados por tipo
      ],
      include: [
        {
          model: CertificatesTypesModel,
          attributes: ['id', 'denominacion'], // Atributos del tipo de certificado
        },
        includeOwner, // Relación con el usuario propietario
      ],
      group: [
        'CertificateModel.id_tipo_certificado', // Incluir id_tipo_certificado en el GROUP BY
        'CertificatesTypesModel.id',
        'CertificatesTypesModel.denominacion',
        'User.id',
        'User.nombre',
        'User.apellido',
      ], // Incluir todas las columnas del SELECT en el GROUP BY
    });

    const certificatesByEmployee = await CertificateModel.findAll({
      attributes: [
        'id_usuario', // Identificador del usuario
        [sequelize.fn('COUNT', sequelize.col('CertificateModel.id')), 'count'], // Contar certificados por usuario
      ],
      include: [
        {
          model: UserModel,
          as: 'User',
          required: true,
          where: {
            id_propietario: ownerId,
          },
          attributes: ['id', 'nombre', 'apellido'], // Atributos del usuario
        },
      ],
      group: ['id_usuario', 'User.id', 'User.nombre', 'User.apellido'], // Agrupar por usuario
    });

    const certificatesByStatus = await CertificateModel.findAll({
      attributes: [
        'estado',
        [sequelize.fn('COUNT', sequelize.col('CertificateModel.id')), 'count'],
      ],
      include: [
        {
          model: UserModel,
          as: 'User',
          required: true,
          attributes: [], // No traer columnas de User
          where: {
            id_propietario: ownerId,
          },
        },
      ],
      group: ['estado'],
    });

    const allCertificatesTypesResponse = allCertificatesTypes.map(
      (certificate) => ({
        name: certificate.CertificatesTypesModel.denominacion,
        count: certificate.get('count') as number,
      }),
    );

    const certificatesByEmployeeResponse = certificatesByEmployee.map(
      (certificate) => ({
        user: `${certificate.User.nombre} ${certificate.User.apellido}`,
        count: certificate.get('count') as number,
      }),
    );

    const certificatesByStatusResponse = certificatesByStatus.map(
      (certificate) => ({
        status: certificate.get('estado') as CertificateStatus,
        count: certificate.get('count') as number,
      }),
    );

    return {
      total: totalCertificates,
      actives: activesCertificates,
      types: allCertificatesTypesResponse,
      employees: certificatesByEmployeeResponse,
      status: certificatesByStatusResponse,
    };
  }

  async getMonthlyStatisticsCertificates({
    requestContext,
    year,
  }: IGetMonthlyStatisticsCertificatesRepository): Promise<IGetMonthlyStatisticsCertificatesRepositoryResponse> {
    const ownerId = requestContext.values.ownerId;
    const currentYear = new Date().getFullYear();
    const selectedYear = year ?? currentYear;

    const includeOwner = {
      model: UserModel,
      as: 'User',
      required: true,
      attributes: [],
      where: {
        id_propietario: ownerId,
      },
    };

    const availableYearsRaw = (await CertificateModel.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('fecha_inicio')), 'year'],
      ],
      include: [includeOwner],
      group: [sequelize.fn('YEAR', sequelize.col('fecha_inicio'))],
      order: [[sequelize.fn('YEAR', sequelize.col('fecha_inicio')), 'DESC']],
      raw: true,
    })) as unknown as { year: string }[];

    const availableYears = availableYearsRaw.map((row) => Number(row.year));

    const monthlyByTypeRaw = (await CertificateModel.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('fecha_inicio')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('CertificateModel.id')), 'count'],
      ],
      include: [
        includeOwner,
        {
          model: CertificatesTypesModel,
          attributes: ['denominacion'],
        },
      ],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn('YEAR', sequelize.col('fecha_inicio')),
            selectedYear,
          ),
        ],
      },
      group: [
        sequelize.fn('MONTH', sequelize.col('fecha_inicio')),
        'CertificatesTypesModel.id',
        'CertificatesTypesModel.denominacion',
      ],
      raw: true,
    })) as unknown as {
      month: string;
      count: string;
      'CertificatesTypesModel.denominacion': string;
    }[];

    const monthMap = new Map<
      number,
      { count: number; byType: Map<string, number> }
    >();

    for (const row of monthlyByTypeRaw) {
      const monthNumber = Number(row.month);
      const typeName = row['CertificatesTypesModel.denominacion'];
      const count = Number(row.count);

      if (!monthMap.has(monthNumber)) {
        monthMap.set(monthNumber, { count: 0, byType: new Map() });
      }
      const entry = monthMap.get(monthNumber)!;
      entry.count += count;
      entry.byType.set(typeName, (entry.byType.get(typeName) ?? 0) + count);
    }

    const months = Array.from({ length: 12 }, (_, index) => {
      const monthNumber = index + 1;
      const entry = monthMap.get(monthNumber);
      return {
        month: monthNumber,
        count: entry?.count ?? 0,
        byType: entry
          ? Array.from(entry.byType.entries()).map(([name, typeCount]) => ({
              name,
              count: typeCount,
            }))
          : [],
      };
    });

    return {
      year: selectedYear,
      months,
      availableYears,
    };
  }

  async deleteCertificate({
    id,
    requestContext: _,
  }: IDeleteCertificateRepository): Promise<void> {
    await CertificateModel.destroy({
      where: { id },
    });
  }

  async getCertificate({
    id,
    requestContext,
  }: IGetCertificateRepository): Promise<Certificate | null> {
    const certificate = await CertificateModel.findOne({
      where: { id },
      include: [
        { model: CertificatesTypesModel },
        {
          model: UserModel,
          as: 'User',
          where: { id_propietario: requestContext.values.ownerId },
        },
      ],
    });

    if (!certificate) return null;

    return Certificate.create({
      id: certificate.id,
      startDate: certificate.fecha_inicio,
      endDate: certificate.fecha_fin,
      returnDate: certificate.fecha_reintegro,
      reason: certificate.motivo,
      type: CertificateTypes.create({
        id: certificate.CertificatesTypesModel.id,
        name: certificate.CertificatesTypesModel.denominacion,
      }),
      requiresRest: Boolean(certificate.requiere_reposo),
      status: certificate.estado,
      files: certificate.archivos,
      userId: certificate.id_usuario,
    });
  }

  async updateCertificateStatus({
    id,
    status,
    requestContext: _,
  }: IUpdateCertificateStatusRepository): Promise<Certificate> {
    const certificate = await CertificateModel.findOne({
      where: { id },
      include: [{ model: CertificatesTypesModel }],
    });

    if (!certificate) {
      throw new Error('Certificate not found');
    }

    await certificate.update({ estado: status });

    return Certificate.create({
      id: certificate.id,
      startDate: certificate.fecha_inicio,
      endDate: certificate.fecha_fin,
      returnDate: certificate.fecha_reintegro,
      reason: certificate.motivo,
      type: CertificateTypes.create({
        id: certificate.CertificatesTypesModel.id,
        name: certificate.CertificatesTypesModel.denominacion,
      }),
      requiresRest: Boolean(certificate.requiere_reposo),
      status: certificate.estado,
      files: certificate.archivos,
      userId: certificate.id_usuario,
    });
  }

  // ── Reporte diario (daily-admin-report) ──────────────────────────────────

  async getEmployeesOnLeaveToday({
    requestContext,
  }: IGetEmployeesOnLeaveTodayRepository): Promise<IEmployeeOnLeaveRecord[]> {
    const ownerId = requestContext.values.ownerId;
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    const certificates = await CertificateModel.findAll({
      where: {
        estado: 'aprobado',
        fecha_inicio: { [Op.lte]: todayEnd },
        fecha_fin: { [Op.gte]: todayStart },
      },
      include: [
        {
          model: UserModel,
          as: 'User',
          required: true,
          where: { id_propietario: ownerId },
          attributes: ['id', 'nombre', 'apellido'],
        },
        {
          model: CertificatesTypesModel,
          attributes: ['denominacion'],
        },
      ],
      order: [[{ model: UserModel, as: 'User' }, 'apellido', 'ASC']],
    });

    return certificates.map((certificate) => ({
      employeeId: certificate.id_usuario,
      employeeName: buildEmployeeName(certificate.User),
      licenseType: certificate.CertificatesTypesModel?.denominacion ?? '',
      startDate: formatDate(certificate.fecha_inicio),
      endDate: formatDate(certificate.fecha_fin),
      returnDate: formatDate(certificate.fecha_reintegro),
    }));
  }

  async getPendingLicenses({
    requestContext,
  }: IGetPendingLicensesRepository): Promise<IPendingLicenseRecord[]> {
    const ownerId = requestContext.values.ownerId;
    const todayStart = startOfToday();
    const dayInMs = 86_400_000;

    const certificates = await CertificateModel.findAll({
      where: { estado: 'pendiente' },
      include: [
        {
          model: UserModel,
          as: 'User',
          required: true,
          where: { id_propietario: ownerId },
          attributes: ['id', 'nombre', 'apellido'],
        },
        {
          model: CertificatesTypesModel,
          attributes: ['denominacion'],
        },
      ],
    });

    return certificates
      .map((certificate) => ({
        employeeId: certificate.id_usuario,
        employeeName: buildEmployeeName(certificate.User),
        licenseType: certificate.CertificatesTypesModel?.denominacion ?? '',
        startDate: formatDate(certificate.fecha_inicio),
        endDate: formatDate(certificate.fecha_fin),
        daysSinceRequest: Math.max(
          0,
          Math.floor(
            (todayStart.getTime() - new Date(certificate.createdAt).getTime()) /
              dayInMs,
          ),
        ),
      }))
      .sort((a, b) => b.daysSinceRequest - a.daysSinceRequest);
  }

  async getUpcomingVacations({
    requestContext,
  }: IGetUpcomingVacationsRepository): Promise<IUpcomingVacationRecord[]> {
    const ownerId = requestContext.values.ownerId;
    const todayStart = startOfToday();
    const in15Days = addDays(todayStart, 15);

    const certificates = await CertificateModel.findAll({
      where: {
        estado: 'aprobado',
        id_tipo_certificado: 1,
        fecha_inicio: { [Op.between]: [todayStart, in15Days] },
      },
      include: [
        {
          model: UserModel,
          as: 'User',
          required: true,
          where: { id_propietario: ownerId },
          attributes: ['id', 'nombre', 'apellido'],
          include: [
            {
              model: UsuariosSegmentosModel,
              required: false,
              attributes: [],
              include: [
                {
                  model: TiposSegmentosModel,
                  required: false,
                  attributes: ['nombre'],
                },
              ],
            },
          ],
        },
        {
          model: CertificatesTypesModel,
          where: { descripcion: { [Op.like]: '%vacaciones%' } },
          attributes: ['denominacion'],
        },
      ],
      order: [[{ model: UserModel, as: 'User' }, 'apellido', 'ASC']],
    });

    return certificates.map((certificate) => ({
      employeeId: certificate.id_usuario,
      employeeName: buildEmployeeName(certificate.User),
      segmentName: employeeSegmentName(certificate.User),
      startDate: formatDate(certificate.fecha_inicio),
      endDate: formatDate(certificate.fecha_fin),
    }));
  }

  async getExpiringLicenses({
    requestContext,
  }: IGetExpiringLicensesRepository): Promise<IExpiringLicenseRecord[]> {
    const ownerId = requestContext.values.ownerId;
    const todayStart = startOfToday();
    const in7Days = addDays(todayStart, 7);

    const certificates = await CertificateModel.findAll({
      where: {
        estado: 'aprobado',
        fecha_fin: { [Op.between]: [todayStart, in7Days] },
      },
      include: [
        {
          model: UserModel,
          as: 'User',
          required: true,
          where: { id_propietario: ownerId },
          attributes: ['id', 'nombre', 'apellido'],
        },
        {
          model: CertificatesTypesModel,
          attributes: ['denominacion'],
        },
      ],
      order: [[{ model: UserModel, as: 'User' }, 'apellido', 'ASC']],
    });

    return certificates.map((certificate) => ({
      employeeId: certificate.id_usuario,
      employeeName: buildEmployeeName(certificate.User),
      licenseType: certificate.CertificatesTypesModel?.denominacion ?? '',
      endDate: formatDate(certificate.fecha_fin),
    }));
  }

  async countLicensesInProgress({
    requestContext,
  }: ICountLicensesInProgressRepository): Promise<number> {
    const ownerId = requestContext.values.ownerId;
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    return CertificateModel.count({
      where: {
        estado: 'aprobado',
        fecha_inicio: { [Op.lte]: todayEnd },
        fecha_fin: { [Op.gte]: todayStart },
      },
      include: [
        {
          model: UserModel,
          as: 'User',
          required: true,
          where: { id_propietario: ownerId },
          attributes: [],
        },
      ],
    });
  }

  async countPendingLicenses({
    requestContext,
  }: ICountPendingLicensesRepository): Promise<number> {
    const ownerId = requestContext.values.ownerId;

    return CertificateModel.count({
      where: { estado: 'pendiente' },
      include: [
        {
          model: UserModel,
          as: 'User',
          required: true,
          where: { id_propietario: ownerId },
          attributes: [],
        },
      ],
    });
  }
}
