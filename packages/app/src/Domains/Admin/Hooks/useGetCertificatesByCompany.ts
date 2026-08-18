import { useURLParams } from '@app/Application';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  CertificatesService,
  TCertificatesSearch,
} from '@app/Domains/Certificates';

export const useGetCertificatesByCompany = () => {
  const { searchParams } = useURLParams<TCertificatesSearch>();
  const queryClient = useQueryClient();

  const input =
    (searchParams && {
      ...searchParams,
      type: searchParams?.type ? Number(searchParams?.type) : undefined,
      year: searchParams?.year
        ? Number(searchParams.year) || undefined
        : undefined,
      segmentos: searchParams?.segmentos
        ? searchParams.segmentos
            .split(',')
            .map(Number)
            .filter((n) => !isNaN(n))
        : undefined,
    }) ||
    undefined;

  const query = CertificatesService.getCertificatesByCompany.useQuery(input, {
    staleTime: 3000,
    refetchOnWindowFocus: true,
  });

  const inputWithoutYear = input
    ? {
        employee: input.employee,
        date: input.date,
        type: input.type,
      }
    : undefined;

  const { data: allYearsData } =
    CertificatesService.getCertificatesByCompany.useQuery(inputWithoutYear, {
      staleTime: 30000,
    });

  useEffect(() => {
    if (allYearsData) {
      const yearsSet = new Set<number>();
      for (const userData of Object.values(allYearsData)) {
        if (userData.certificates) {
          for (const year of Object.keys(userData.certificates)) {
            yearsSet.add(Number(year));
          }
        }
      }
      const years = Array.from(yearsSet).sort((a, b) => b - a);
      queryClient.setQueryData(['certificatesYears', 'admin'], years);
    }
  }, [allYearsData, queryClient]);

  const availableYears =
    queryClient.getQueryData<number[]>(['certificatesYears', 'admin']) ?? [];

  return { ...query, availableYears };
};

export type TuseGetCertificatesByCompany = ReturnType<
  typeof useGetCertificatesByCompany
>;
