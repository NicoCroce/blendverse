import { useURLParams } from '@app/Application';
import { normalizeState, TDocumentSearch } from '../Document.entity';
import { DocumentsService } from '../Documents.service';

export const useGetDocuments = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  const { id, segmentos: rawSegmentos, state, ...rest } = searchParams || {};

  const segmentos = rawSegmentos
    ? rawSegmentos
        .split(',')
        .map(Number)
        .filter((n) => !isNaN(n))
    : undefined;

  return DocumentsService.getAll.useQuery(
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

export type TuseGetDocuments = ReturnType<typeof useGetDocuments>;
