import { CertificateStatus } from '../../Domain/Certificate.types';

export interface CertificateDTO {
  id: number;
  startDate: string;
  endDate: string;
  returnDate: string;
  reason: string;
  type: string;
  requiresRest: boolean;
  status: CertificateStatus;
  files?: string[];
}

export interface IGetCertificatesDTO {
  [key: number]: CertificateDTO[];
}
export interface IGetCertificatesByCompanyDTO {
  [userId: number]: {
    user: string;
    certificates: {
      [year: number]: CertificateDTO[];
    };
  };
}
