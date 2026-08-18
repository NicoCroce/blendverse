import { useURLParams } from '@app/Application';
import {
  DocumentsService,
  normalizeState,
  TDocumentSearch,
} from '@app/Domains/Documents';

export const useGetDocumentsByCompany = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();

  const { id, segmentos: rawSegmentos, state, ...rest } = searchParams || {};

  const segmentos = rawSegmentos
    ? rawSegmentos
        .split(',')
        .map(Number)
        .filter((n) => !isNaN(n))
    : undefined;

  return DocumentsService.getAllByCompany.useQuery(
    {
      ...rest,
      state: normalizeState(state),
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
