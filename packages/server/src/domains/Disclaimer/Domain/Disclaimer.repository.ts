import { IRequestContext, IPaginationResponse } from '@server/Application';
import { DisclaimerAcceptance } from './DisclaimerAcceptance.entity';

export interface IGetSignatureStatusRepository extends IRequestContext {
  termsVersionId: number;
}

export interface ISignDisclaimerRepository extends IRequestContext {
  hash: string;
  ip: string;
  userAgent: string | null;
  timestamp: Date;
  termsVersionId: number;
}

export interface IGetEmployeesByCompanyRepository extends IRequestContext {
  termsVersionId: number;
  search?: string;
  page?: string;
  limit?: string;
  withoutSegments?: boolean;
  segmentIds?: number[];
}

export interface IGetPendingEmployeeIdsRepository extends IRequestContext {
  termsVersionId: number;
}

export interface IEmployeeRecord {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  renovar_clave: boolean;
  estado_firma: 'Pendiente' | 'Firmado' | 'Corrupto';
}

// ── Reporte diario (daily-admin-report) ─────────────────────────────────────

export type IGetPendingDisclaimerAcceptancesRepository = IRequestContext & {
  termsVersionId: number;
};
export type ICountPendingDisclaimersRepository = IRequestContext & {
  termsVersionId: number;
};

export interface IPendingDisclaimerAcceptanceRecord {
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
}

export interface DisclaimerRepository {
  getStatus(
    params: IGetSignatureStatusRepository,
  ): Promise<DisclaimerAcceptance | null>;

  sign(params: ISignDisclaimerRepository): Promise<DisclaimerAcceptance>;

  getEmployeesByCompany(
    params: IGetEmployeesByCompanyRepository,
  ): Promise<IPaginationResponse<IEmployeeRecord[]>>;

  getPendingEmployeeIds(
    params: IGetPendingEmployeeIdsRepository,
  ): Promise<number[]>;

  // Reporte diario (daily-admin-report)
  getEmployeesWithoutDisclaimerAcceptance(
    params: IGetPendingDisclaimerAcceptancesRepository,
  ): Promise<IPendingDisclaimerAcceptanceRecord[]>;
  countPendingDisclaimers(
    params: ICountPendingDisclaimersRepository,
  ): Promise<number>;
}
