import { _certificatesService } from '../Certificates.service';

export const useCacheCertificates = () =>
  _certificatesService.useUtils().certificates.getAll;
