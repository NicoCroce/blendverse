import { createTRPCReact } from '@trpc/react-query';
import { TCertificatesRouter } from '@server/domains/Certificates';

export const _certificatesService = createTRPCReact<TCertificatesRouter>();
export const CertificatesService = _certificatesService.certificates;
