import { inferRouterOutputs } from '@trpc/server';
import { TCertificatesRouter } from '@server/domains/Certificates';
import { CertificateStatus } from '@server/domains/Certificates/Domain/Certificate.types';

type TCertificatesOutput = inferRouterOutputs<TCertificatesRouter>;

export type ICertificate =
  TCertificatesOutput['certificates']['addCertificate'];
export type TCertificateType =
  TCertificatesOutput['certificates']['getCertificateTypes'][number];

export type TCertificatesSearch = {
  employee?: string;
  date?: string;
  type?: string;
  year?: string;
  status?: CertificateStatus;
  segmentos?: string;
};
