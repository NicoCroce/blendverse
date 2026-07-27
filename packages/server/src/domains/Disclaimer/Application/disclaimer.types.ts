import { IRequestContext } from '@server/Application';

// GetDisclaimerText
export type IGetDisclaimerText = IRequestContext & { input: number };

// GetSignatureStatus
export type IGetSignatureStatus = IRequestContext & {
  input: { userId: number; ownerId: number };
};

// SignDisclaimer
export interface ISignDisclaimer extends IRequestContext {
  input: {
    password: string;
    ip: string;
    userAgent: string | null;
  };
}

// GetEmployeesByCompany
export interface IGetEmployeesByCompany extends IRequestContext {
  input: {
    ownerId?: number;
    search?: string;
    page?: string;
    limit?: string;
  };
}

// SendReminders
export interface ISendReminders extends IRequestContext {
  input: {
    ownerId?: number;
    employeeIds?: number[];
  };
}

export interface ISendRemindersResponse {
  sent: number;
  failed: number;
  total: number;
}
