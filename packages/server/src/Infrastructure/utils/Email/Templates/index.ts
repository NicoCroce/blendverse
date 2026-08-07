import { addLicense } from './addLicense.template';
import { licenseStatusChange } from './licenseStatusChange.template';
import {
  documentSignedAdmin,
  documentSignedEmployee,
} from './documentSigned.template';
import { disclaimerReminder } from './disclaimerReminder.template';
import { dailyReport } from './dailyReport.template';
import { employeeDailyReminder } from './employeeDailyReminder.template';
import { newDocumentNotification } from './newDocumentNotification.template';

export * from './types';
export * from './shared';
export * from './addLicense.template';
export * from './licenseStatusChange.template';
export * from './documentSigned.template';
export * from './disclaimerReminder.template';
export * from './dailyReport.template';
export * from './employeeDailyReminder.template';
export * from './newDocumentNotification.template';

/** Registro de templates por caso de email. */
export const emailTemplates = {
  addLicense,
  licenseStatusChange,
  documentSignedAdmin,
  documentSignedEmployee,
  disclaimerReminder,
  dailyReport,
  employeeDailyReminder,
  newDocumentNotification,
};
