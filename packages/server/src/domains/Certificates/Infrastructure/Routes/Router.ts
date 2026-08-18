import { router } from '@server/Infrastructure/trpc';
import { CertificatesRoutes } from './CertificatesRoutes';

// Type is inferred from CertificatesRoutes which includes deleteCertificate and updateCertificateStatus
const _CertificateRouter = () => router(CertificatesRoutes());
export type TCertificatesRouter = ReturnType<typeof _CertificateRouter>;
