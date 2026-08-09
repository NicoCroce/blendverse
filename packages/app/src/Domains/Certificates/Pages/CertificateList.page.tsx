import {
  Container,
  EmptyScreenError,
  EmptyScreenFilter,
  FiltersSheet,
  Page,
} from '@app/Application';
import {
  CertificatesGrid,
  ActionsCertificateListPage,
  FiltersCertificatesForm,
  CertificatesListSkeleton,
} from '../Components';

import { useGetCertificates } from '../Hooks';
import { useState } from 'react';
import { TCertificate } from '..';

export const CertificateListPage = () => {
  const { data, isLoading, isError, error, availableYears } =
    useGetCertificates();
  const [filtersIsOpen, setFiltersIsOpen] = useState(false);

  const handleFilters = () => {
    setFiltersIsOpen((prevState) => !prevState);
  };

  if (isError) {
    return <EmptyScreenError message={error?.message} />;
  }

  if (isLoading) {
    return (
      <Page
        title="Licencias"
        headerRight={<ActionsCertificateListPage onClick={handleFilters} />}
      >
        <CertificatesListSkeleton />
      </Page>
    );
  }

  if (data && Object.keys(data).length === 0)
    return <EmptyScreenFilter onClick={handleFilters} />;

  return (
    <Page
      title="Licencias"
      headerRight={<ActionsCertificateListPage onClick={handleFilters} />}
    >
      <>
        {data &&
          Object.entries(data).map(([year, certificates]) => {
            const list = certificates as TCertificate[];
            return (
              <Container key={year} block className="mt-10 first:mt-0">
                <Container
                  row
                  align="end"
                  justify="between"
                  space="medium"
                  className="pb-3 border-b"
                >
                  <Container
                    row
                    align="baseline"
                    space="small"
                    className="gap-3"
                  >
                    <span className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                      {year}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {list.length}{' '}
                      {list.length === 1 ? 'licencia' : 'licencias'}
                    </span>
                  </Container>
                </Container>
                <Container block className="mt-6">
                  <CertificatesGrid
                    certificatesList={list}
                    year={Number(year)}
                  />
                </Container>
              </Container>
            );
          })}
        <FiltersSheet
          open={filtersIsOpen}
          closeSheet={handleFilters}
          title="Filtros de Certificados"
          description="Puedes filtrar los certificados por los siguientes parámetros"
        >
          <FiltersCertificatesForm availableYears={availableYears} />
        </FiltersSheet>
      </>
    </Page>
  );
};
