import { EmployeePendingSection } from './EmployeePendingSection.types';

/**
 * DTO de salida (no persistente) del recordatorio diario de pendientes
 * de UN empleado. `shouldSend` se calcula: true si existe al menos un
 * pendiente (FR-008); si es false no se envía email.
 */
export interface IEmployeeReminder {
  ownerId: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  companyName: string;
  date: string; // ISO 8601 (YYYY-MM-DD)
  pending: EmployeePendingSection;
  shouldSend: boolean;
}

export type IEmployeeReminderInput = Omit<IEmployeeReminder, 'shouldSend'>;

export class EmployeeReminder {
  constructor(
    protected readonly _ownerId: number,
    protected readonly _employeeId: number,
    protected readonly _employeeName: string,
    protected readonly _employeeEmail: string,
    protected readonly _companyName: string,
    protected readonly _date: string,
    protected readonly _pending: EmployeePendingSection,
  ) {}

  static create(input: IEmployeeReminderInput): EmployeeReminder {
    return new EmployeeReminder(
      input.ownerId,
      input.employeeId,
      input.employeeName,
      input.employeeEmail,
      input.companyName,
      input.date,
      input.pending,
    );
  }

  toJSON() {
    return this.values;
  }

  get shouldSend(): boolean {
    return (
      this._pending.unsignedDocuments.length > 0 ||
      this._pending.unviewedDocuments.length > 0 ||
      this._pending.pendingDisclaimerAcceptance ||
      this._pending.renewPassword
    );
  }

  get values(): IEmployeeReminder {
    return {
      ownerId: this._ownerId,
      employeeId: this._employeeId,
      employeeName: this._employeeName,
      employeeEmail: this._employeeEmail,
      companyName: this._companyName,
      date: this._date,
      pending: this._pending,
      shouldSend: this.shouldSend,
    };
  }
}
