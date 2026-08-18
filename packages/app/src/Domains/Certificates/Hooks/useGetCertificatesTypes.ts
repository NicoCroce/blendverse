import { CertificatesService } from '../Certificates.service';

export const useGetCertificatesTypes = () => {
  return CertificatesService.getCertificateTypes.useQuery();
};
