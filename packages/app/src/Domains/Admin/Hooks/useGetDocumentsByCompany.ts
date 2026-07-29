import { useURLParams } from '@app/Application';
import { documentsService, TDocumentSearch } from '@app/Domains/Documents';

export const useGetDocumentsByCompany = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();

  const { id, segmentos: rawSegmentos, ...rest } = searchParams || {};

  const segmentos = rawSegmentos
    ? rawSegmentos
        .split(',')
        .map(Number)
        .filter((n) => !isNaN(n))
    : undefined;

  return documentsService.getAllByCompany.useQuery(
    {
      ...rest,
      ...(segmentos && segmentos.length > 0 ? { segmentos } : {}),
    },
    {
      staleTime: 3000,
    },
  );
};

export type TuseGetDocumentsByCompany = ReturnType<
  typeof useGetDocumentsByCompany
>;
