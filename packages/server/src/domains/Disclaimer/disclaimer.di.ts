import { asClass } from 'awilix';
import {
  CountPendingDisclaimers,
  DisclaimerService,
  GetDisclaimerText,
  GetPendingDisclaimerAcceptances,
  GetSignatureStatus,
  SignDisclaimer,
  GetEmployeesByCompany,
  SendReminders,
} from './Application';
import {
  DisclaimerController,
  DisclaimerRepositoryImplementation,
  DisclaimerEmailService,
} from './Infrastructure';
import { UsersRepositoryImplementation } from '@server/domains/Users/Infrastructure';
import { container } from '@server/Infrastructure/di/Container';

export const disclaimerApp = {
  disclaimerRepository: asClass(DisclaimerRepositoryImplementation),
  userRepository: asClass(UsersRepositoryImplementation),
  disclaimerEmailService: asClass(DisclaimerEmailService),
  disclaimerService: asClass(DisclaimerService),
  disclaimerController: asClass(DisclaimerController),
  _getDisclaimerText: asClass(GetDisclaimerText),
  _getSignatureStatus: asClass(GetSignatureStatus),
  _signDisclaimer: asClass(SignDisclaimer),
  _getEmployeesByCompany: asClass(GetEmployeesByCompany),
  _sendReminders: asClass(SendReminders),
  // Reporte diario (daily-admin-report)
  _getPendingDisclaimerAcceptances: asClass(GetPendingDisclaimerAcceptances),
  _countPendingDisclaimers: asClass(CountPendingDisclaimers),
};

export const disclaimerController = () =>
  container.resolve<DisclaimerController>('disclaimerController');
