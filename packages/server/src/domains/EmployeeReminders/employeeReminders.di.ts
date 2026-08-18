import { asClass } from 'awilix';
import { container } from '@server/Infrastructure/di/Container';
import {
  EmployeeRemindersService,
  GenerateDailyReminder,
  NotifyNewDocument,
  SendEmployeeReminderEmail,
} from './Application';
import { EmployeeRemindersController } from './Infrastructure/Controllers';
import { EmployeeEmailSenderImplementation } from './Infrastructure/Email';
import { EmployeeRemindersScheduler } from './Infrastructure/Scheduler';

/**
 * Registro Awilix del dominio EmployeeReminders.
 *
 * Los use cases cross-domain (`_getEmployeesByCompany`, `_getAllActiveOwners`,
 * `_getPendingDocumentsByEmployee`, `_getUser`) NO se re-registran aquí: se
 * resuelven desde los contenedores de sus dominios dueños (Disclaimer, Users,
 * Documents) usando los keys `_getX` que exponen, tal como exige el patrón
 * cross-domain del proyecto (Pr. VII).
 */
export const employeeRemindersApp = {
  employeeRemindersService: asClass(EmployeeRemindersService),
  employeeRemindersController: asClass(EmployeeRemindersController),
  employeeRemindersScheduler: asClass(EmployeeRemindersScheduler),
  employeeEmailSender: asClass(EmployeeEmailSenderImplementation),
  _generateDailyReminder: asClass(GenerateDailyReminder),
  _sendEmployeeReminderEmail: asClass(SendEmployeeReminderEmail),
  _notifyNewDocument: asClass(NotifyNewDocument),
};

export const employeeRemindersController = () =>
  container.resolve<EmployeeRemindersController>('employeeRemindersController');

export const employeeRemindersScheduler = () =>
  container.resolve<EmployeeRemindersScheduler>('employeeRemindersScheduler');
