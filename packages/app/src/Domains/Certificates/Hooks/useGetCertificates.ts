import { useURLParams } from '@app/Application';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { CertificatesService } from '../Certificates.service';
import { TCertificatesSearch } from '../Certificate.entity';

export const useGetCertificates = () => {
  const { searchParams } = useURLParams<TCertificatesSearch>();
  const queryClient = useQueryClient();

  const input =
    (searchParams && {
      ...searchParams,
      type: Number(searchParams?.type) || undefined,
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

  const query = CertificatesService.getAll.useQuery(input, {
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

  const { data: allYearsData } = CertificatesService.getAll.useQuery(
    inputWithoutYear,
    { staleTime: 30000 },
  );

  useEffect(() => {
    if (allYearsData) {
      const years = Object.keys(allYearsData)
        .map(Number)
        .sort((a, b) => b - a);
      queryClient.setQueryData(['certificatesYears'], years);
    }
  }, [allYearsData, queryClient]);

  const availableYears =
    queryClient.getQueryData<number[]>(['certificatesYears']) ?? [];

  return { ...query, availableYears };
};
