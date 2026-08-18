import { certificatesController } from '../../certificates.di';

export const CertificatesRoutes = () => {
  const {
    getCertificates,
    getCertificateTypes,
    addCertificate,
    getCertificatesByCompany,
    getStatisticsByCertificates,
    getStatisticsByCertificatesMonthly,
    deleteCertificate,
    updateCertificateStatus,
  } = certificatesController();

  return {
    certificates: {
      getAll: getCertificates,
      getCertificateTypes,
      addCertificate,
      getCertificatesByCompany,
      getStatistics: getStatisticsByCertificates,
      getStatisticsMonthly: getStatisticsByCertificatesMonthly,
      deleteCertificate,
      updateCertificateStatus,
    },
  };
};
