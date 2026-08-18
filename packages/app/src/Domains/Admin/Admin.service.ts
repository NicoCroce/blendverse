import { TDisclaimerRouter } from '@server/domains/Disclaimer';
import { TDocumentRouter } from '@server/domains/Documents';
import { TCertificatesRouter } from '@server/domains/Certificates';
import { TSegmentsRouter } from '@server/domains/Segments';
import { createTRPCReact } from '@trpc/react-query';

export const _adminDisclaimerService = createTRPCReact<TDisclaimerRouter>();
export const AdminDisclaimerService = _adminDisclaimerService.disclaimer;

export const _adminDocumentsService = createTRPCReact<TDocumentRouter>();
export const AdminDocumentsService = _adminDocumentsService.documents;

export const _adminCertificatesService = createTRPCReact<TCertificatesRouter>();
export const AdminCertificatesService = _adminCertificatesService.certificates;

export const _adminSegmentsService = createTRPCReact<TSegmentsRouter>();
export const AdminSegmentsService = _adminSegmentsService.segments;
