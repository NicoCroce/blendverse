import { IRequestContext } from '@server/Application';
import { Certificate } from './Certificate.entity';
import { CertificateTypes } from './CertificateTypes.entity';
import {
  ICertificate,
  IGetMonthlyStatisticsCertificatesResponse,
  IGetStatisticsCertificatesResponse,
  CertificateStatus,
} from './Certificate.types';

interface IFilters {
  filters?: {
    employee?: string;
    date?: Date;
    type?: number;
    year?: number;
    status?: CertificateStatus;
  };
}

export interface IGetCertificatesRepository extends IRequestContext, IFilters {}
export interface IAddCertificateRepository extends IRequestContext {
  certificate: Certificate;
}

export interface IAppendImagesRepository extends IRequestContext {
  certificateId: number;
  files: string[];
}

export type IGetStatisticsCertificatesRepository = IRequestContext;
export interface IGetMonthlyStatisticsCertificatesRepository extends IRequestContext {
  year?: number;
}

export interface IGetAllCompanyCertificatesRepository
  extends IRequestContext, IFilters {}

export interface IGetAllCompanyCertificatesRepositoryResponse extends ICertificate {
  userName: string;
}

export type IGetStatisticsCertificatesRepositoryResponse =
  IGetStatisticsCertificatesResponse;

export type IGetMonthlyStatisticsCertificatesRepositoryResponse =
  IGetMonthlyStatisticsCertificatesResponse;

export interface IDeleteCertificateRepository extends IRequestContext {
  id: number;
}

export interface IUpdateCertificateStatusRepository extends IRequestContext {
  id: number;
  status: CertificateStatus;
}

export interface IGetCertificateRepository extends IRequestContext {
  id: number;
}

// ── Reporte diario (daily-admin-report) ─────────────────────────────────────

export type IGetEmployeesOnLeaveTodayRepository = IRequestContext;
export type IGetPendingLicensesRepository = IRequestContext;
export type IGetUpcomingVacationsRepository = IRequestContext;
export type IGetExpiringLicensesRepository = IRequestContext;
export type ICountLicensesInProgressRepository = IRequestContext;
export type ICountPendingLicensesRepository = IRequestContext;

export interface IEmployeeOnLeaveRecord {
  employeeId: number;
  employeeName: string;
  licenseType: string;
  startDate: string; // ISO 8601 (YYYY-MM-DD)
  endDate: string; // ISO 8601 (YYYY-MM-DD)
  returnDate: string; // ISO 8601 (YYYY-MM-DD)
}

export interface IPendingLicenseRecord {
  employeeId: number;
  employeeName: string;
  licenseType: string;
  startDate: string; // ISO 8601 (YYYY-MM-DD)
  endDate: string; // ISO 8601 (YYYY-MM-DD)
  daysSinceRequest: number;
}

export interface IUpcomingVacationRecord {
  employeeId: number;
  employeeName: string;
  segmentName: string | null;
  startDate: string; // ISO 8601 (YYYY-MM-DD)
  endDate: string; // ISO 8601 (YYYY-MM-DD)
}

export interface IExpiringLicenseRecord {
  employeeId: number;
  employeeName: string;
  licenseType: string;
  endDate: string; // ISO 8601 (YYYY-MM-DD)
}

export interface CertificateRepository {
  getCertificates({
    filters,
    requestContext,
  }: IGetCertificatesRepository): Promise<Certificate[]>;
  getCertificatesTypes({
    requestContext,
  }: IGetCertificatesRepository): Promise<CertificateTypes[]>;
  addCertificate({
    requestContext,
    certificate,
  }: IAddCertificateRepository): Promise<Certificate>;
  appendImages({
    requestContext,
    certificateId,
    files,
  }: IAppendImagesRepository): Promise<Certificate>;
  getAllCompanyCertificates({
    filters,
    requestContext,
  }: IGetAllCompanyCertificatesRepository): Promise<
    IGetAllCompanyCertificatesRepositoryResponse[]
  >;
  getStatisticsCertificates({
    requestContext,
  }: IGetStatisticsCertificatesRepository): Promise<IGetStatisticsCertificatesRepositoryResponse>;
  getMonthlyStatisticsCertificates({
    requestContext,
  }: IGetMonthlyStatisticsCertificatesRepository): Promise<IGetMonthlyStatisticsCertificatesRepositoryResponse>;
  deleteCertificate({
    id,
    requestContext,
  }: IDeleteCertificateRepository): Promise<void>;
  updateCertificateStatus({
    id,
    status,
    requestContext,
  }: IUpdateCertificateStatusRepository): Promise<Certificate>;
  getCertificate({
    id,
    requestContext,
  }: IGetCertificateRepository): Promise<Certificate | null>;
  // Reporte diario (daily-admin-report)
  getEmployeesOnLeaveToday(
    params: IGetEmployeesOnLeaveTodayRepository,
  ): Promise<IEmployeeOnLeaveRecord[]>;
  getPendingLicenses(
    params: IGetPendingLicensesRepository,
  ): Promise<IPendingLicenseRecord[]>;
  getUpcomingVacations(
    params: IGetUpcomingVacationsRepository,
  ): Promise<IUpcomingVacationRecord[]>;
  getExpiringLicenses(
    params: IGetExpiringLicensesRepository,
  ): Promise<IExpiringLicenseRecord[]>;
  countLicensesInProgress(
    params: ICountLicensesInProgressRepository,
  ): Promise<number>;
  countPendingLicenses(
    params: ICountPendingLicensesRepository,
  ): Promise<number>;
}
