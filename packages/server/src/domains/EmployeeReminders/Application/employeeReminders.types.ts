import { IRequestContext } from '@server/Application';
import { IEmployeeReminder } from '../Domain/EmployeeReminder.entity';

// ── GenerateDailyReminder ───────────────────────────────────────────────────

export interface IGenerateDailyReminderInput {
  companyName: string;
}

export interface IGenerateDailyReminder extends IRequestContext {
  input: IGenerateDailyReminderInput;
}

export interface IGenerateDailyReminderOutput {
  reminders: IEmployeeReminder[];
}

// ── SendEmployeeReminderEmail ───────────────────────────────────────────────

export interface ISendEmployeeReminderEmailInput {
  reminder: IEmployeeReminder;
}

export interface ISendEmployeeReminderEmail extends IRequestContext {
  input: ISendEmployeeReminderEmailInput;
}

export interface ISendEmployeeReminderEmailOutput {
  sent: boolean;
}

// ── NotifyNewDocument (notificación en tiempo real) ─────────────────────────

export interface INewDocumentNotification {
  ownerId: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  companyName: string;
  documents: Array<{ documentId: number; documentTitle: string }>; // ≥1
}

export interface INotifyNewDocument extends IRequestContext {
  input: INewDocumentNotification;
}

export interface INotifyNewDocumentOutput {
  notified: boolean;
}

// ── EmployeeRemindersService ────────────────────────────────────────────────

export interface ISendDailyRemindersOutput {
  sent: number;
  skipped: number;
  failed: number;
  totalOwners: number;
}
