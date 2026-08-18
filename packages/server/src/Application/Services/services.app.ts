import { asClass } from 'awilix';
import { SendEmailService } from './SendEmail.service';
import {
  InstitutionalEmailNotificationAdapter,
  MailNotificationService,
} from '@server/Infrastructure';

export const servicesApp = () => ({
  mailNotificationService: asClass(MailNotificationService),
  sendEmailService: asClass(SendEmailService),
  emailNotificationPort: asClass(InstitutionalEmailNotificationAdapter),
});
