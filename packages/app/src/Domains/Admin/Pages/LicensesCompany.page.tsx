import { useMemo } from 'react';
import { Container, Page, useURLParams } from '@app/Application';

import { useGetCertificatesByCompany } from '../Hooks';
import {
  LicensesListWrapper,
  MonthlyLicensesChart,
  StatisticsCertificates,
} from '../Components';
import { useGetUsersBySegments } from '@app/Domains/Segments/Application/segments.queries';

type LicensesCompanyParams = {
  segmentos?: string;
};

export const LicensesCompanyPage = () => {
  const service = useGetCertificatesByCompany();
  const { searchParams } = useURLParams<LicensesCompanyParams>();

  const segmentIds = useMemo(() => {
    const raw = searchParams?.segmentos;
    if (!raw) return [];
    return raw
      .split(',')
      .map(Number)
      .filter((n) => !isNaN(n));
  }, [searchParams?.segmentos]);

  const { data: filteredUserIds } = useGetUsersBySegments(
    { segmentIds },
    { enabled: segmentIds.length > 0 },
  );

  return (
    <Page title="Todos los certificados de la empresa">
      <Container>
        <StatisticsCertificates />
        <MonthlyLicensesChart />
        <Container row>
          <div className="min-w-75 w-full">
            <LicensesListWrapper
              service={service}
              filteredUserIds={
                filteredUserIds ? new Set(filteredUserIds) : undefined
              }
            />
          </div>
        </Container>
      </Container>
    </Page>
  );
};
