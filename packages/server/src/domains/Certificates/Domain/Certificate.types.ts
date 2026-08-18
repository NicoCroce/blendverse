import { CertificateTypes } from './CertificateTypes.entity';

export type CertificateStatus =
  | 'aprobado'
  | 'rechazado'
  | 'pendiente'
  | 'validando'
  | 'eliminado';

export interface ICertificate {
  id?: number;
  startDate: Date;
  endDate: Date;
  returnDate: Date;
  reason: string;
  type: CertificateTypes;
  files?: string[];
  requiresRest: boolean;
  status?: CertificateStatus;
  userId?: number;
}

export interface IGetStatisticsCertificatesResponse {
  total: number;
  actives: number;
  types: {
    name: string;
    count: number;
  }[];
  employees: {
    user: string;
    count: number;
  }[];
  status: {
    status: CertificateStatus;
    count: number;
  }[];
}

export interface IMonthlyStatisticByType {
  name: string;
  count: number;
}

export interface IMonthlyStatistic {
  month: number; // 1-12
  count: number;
  byType: IMonthlyStatisticByType[];
}

export interface IGetMonthlyStatisticsCertificatesResponse {
  year: number;
  months: IMonthlyStatistic[];
  availableYears: number[];
}
