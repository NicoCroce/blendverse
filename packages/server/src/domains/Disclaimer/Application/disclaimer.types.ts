import { IRequestContext } from '@server/Application';
import { z } from 'zod';

// GetDisclaimerText — the tenant is always taken from RequestContext.
export type IGetDisclaimerText = IRequestContext & { input?: undefined };

export const getDisclaimerTextResponseSchema = z.object({
  content: z.string(),
  version: z.number().int().positive().nullable(),
});

export type IGetDisclaimerTextResponse = z.infer<
  typeof getDisclaimerTextResponseSchema
>;

// GetSignatureStatus
export type IGetSignatureStatus = IRequestContext & {
  input?: object;
};

// SignDisclaimer
export type ISignDisclaimerInput = {
  password: string;
  ip: string;
  userAgent: string | null;
  termsVersion: number;
};

export interface ISignDisclaimer extends IRequestContext {
  input: ISignDisclaimerInput;
}

// GetEmployeesByCompany
export interface IGetEmployeesByCompany extends IRequestContext {
  input: {
    search?: string;
    page?: string;
    limit?: string;
    withoutSegments?: boolean;
    segmentIds?: number[];
  };
}

// SendReminders
export interface ISendReminders extends IRequestContext {
  input: {
    employeeIds?: number[];
  };
}

export interface ISendRemindersResponse {
  sent: number;
  failed: number;
  total: number;
}
