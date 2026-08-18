import { IRequestContext } from '@server/Application';
import { Certificate } from '../Domain/Certificate.entity';
import { ICertificate, CertificateStatus } from '../Domain/Certificate.types';

interface IFilters {
  input?: {
    employee?: string;
    date?: Date;
    type?: number;
    year?: number;
    status?: CertificateStatus;
  };
}

export interface IGetCertificates extends IRequestContext, IFilters {}
export interface IGetCertificatesCompany extends IRequestContext, IFilters {}
export type IGetCertificateTypes = IRequestContext;
export interface IAddCertificate extends IRequestContext {
  input: Omit<ICertificate, 'id' | 'type'> & { type: number };
}

export type IGetStatisticsCertificates = IRequestContext;
export interface IGetMonthlyStatisticsCertificates extends IRequestContext {
  input?: {
    year?: number;
  };
}

export interface IGetCertificatesResponse {
  [key: number]: Certificate[];
}

export interface IGetCertificatesByCompanyResponse {
  [userId: number]: {
    user: string;
    certificates: {
      [year: number]: Certificate[];
    };
  };
}

export interface IAppendImages extends IRequestContext {
  input: {
    file?: Express.Multer.File;
    protocol: string;
    host: string;
    id: number;
  };
}

export interface IDeleteCertificate extends IRequestContext {
  input: { id: number };
}

export interface IUpdateCertificateStatus extends IRequestContext {
  input: { id: number; status: CertificateStatus };
}
