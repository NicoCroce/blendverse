import { asClass } from 'awilix';
import { CertificatesServices } from './Application';
import {
  AddCertificate,
  CountLicensesInProgress,
  CountPendingLicenses,
  DeleteCertificate,
  GetCertificates,
  GetCertificatesByCompany,
  GetCertificateTypes,
  GetEmployeesOnLeaveToday,
  GetExpiringLicenses,
  AppendImages,
  GetMonthlyStatisticsCertificates,
  GetPendingLicenses,
  GetStatisticsCertificates,
  GetUpcomingVacations,
  UpdateCertificateStatus,
} from './Application';
import {
  CertificatesController,
  SaveImagesController,
} from './Infrastructure/Controllers';
import { container } from '@server/Infrastructure/di/Container';
import { CertificatesRepositoryImplementation } from './Infrastructure/Databases';
import { GetRoleByUser } from '@server/domains/Permissions/Application/UseCases/GetRoleByUser.usecase';

export const certificatesApp = {
  certificatesRepository: asClass(CertificatesRepositoryImplementation),
  certificatesService: asClass(CertificatesServices),
  certificatesController: asClass(CertificatesController),
  saveImagesController: asClass(SaveImagesController),
  _getCertificates: asClass(GetCertificates),
  _getCertificateTypes: asClass(GetCertificateTypes),
  _addCertificate: asClass(AddCertificate),
  _appendImages: asClass(AppendImages),
  _getCertificatesByCompany: asClass(GetCertificatesByCompany),
  _getStatistisCertificates: asClass(GetStatisticsCertificates),
  _getMonthlyStatistisCertificates: asClass(GetMonthlyStatisticsCertificates),
  _deleteCertificate: asClass(DeleteCertificate),
  _updateCertificateStatus: asClass(UpdateCertificateStatus),
  getRoleByUser: asClass(GetRoleByUser),
  // Reporte diario (daily-admin-report)
  _getEmployeesOnLeaveToday: asClass(GetEmployeesOnLeaveToday),
  _getPendingLicenses: asClass(GetPendingLicenses),
  _getUpcomingVacations: asClass(GetUpcomingVacations),
  _getExpiringLicenses: asClass(GetExpiringLicenses),
  _countLicensesInProgress: asClass(CountLicensesInProgress),
  _countPendingLicenses: asClass(CountPendingLicenses),
};

export const certificatesController = () =>
  container.resolve<CertificatesController>('certificatesController');

export const saveImagesController = () =>
  container.resolve<SaveImagesController>('saveImagesController');
