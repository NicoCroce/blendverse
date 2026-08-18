import { endOfDay, startOfDay } from '@server/Application';
import { sequelize } from '@server/Infrastructure';
import { Op, WhereOptions } from 'sequelize';
import { IGetCertificatesRepository } from '../../Domain';
import { CertificateModel } from './Certificates.model';
import { UserModel } from '@server/domains/Users';

export const CertificatesFilters = (
  filters: IGetCertificatesRepository['filters'],
) => {
  type TWhereConditionCertificates = WhereOptions<CertificateModel>;
  const whereConditionCertificates: WhereOptions<CertificateModel> = {};

  // Condiciones para el modelo de usuarios
  type TWhereConditionUsers = WhereOptions<UserModel>;
  const whereConditionUsers: TWhereConditionUsers = {};

  // Si hay un filtro de empleado, lo aplicamos a los atributos nombre o apellido del usuario
  if (filters?.employee)
    whereConditionUsers[Op.or as keyof TWhereConditionUsers] = [
      { nombre: { [Op.substring]: filters.employee } },
      { apellido: { [Op.substring]: filters.employee } },
    ];

  if (filters?.type)
    whereConditionCertificates.id_tipo_certificado = filters.type;

  if (filters?.status) whereConditionCertificates.estado = filters.status;

  // Acumulamos condiciones AND para fecha y año sin pisarlas entre sí
  const andConditions: WhereOptions<CertificateModel>[] = [];

  // Si hay un filtro de fecha, buscamos certificados que incluyan esa fecha
  if (filters?.date) {
    const dayStart = startOfDay(filters.date);
    const dayEnd = endOfDay(filters.date);

    andConditions.push({ fecha_inicio: { [Op.lte]: dayEnd } });
    andConditions.push({ fecha_fin: { [Op.gte]: dayStart } });
  }

  // Si hay un filtro de año, filtramos por YEAR(fecha_inicio)
  if (filters?.year != null) {
    andConditions.push(
      sequelize.where(
        sequelize.fn('YEAR', sequelize.col('fecha_inicio')),
        filters.year,
      ),
    );
  }

  if (andConditions.length > 0) {
    whereConditionCertificates[Op.and as keyof TWhereConditionCertificates] =
      andConditions;
  }

  return {
    whereConditionCertificates,
    whereConditionUsers,
  };
};
