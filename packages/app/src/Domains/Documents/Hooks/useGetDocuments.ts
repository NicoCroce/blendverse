import { useURLParams } from '@app/Application';
import { TDocumentSearch } from '../Document.entity';
import { documentsService } from '../Documents.service';

export const useGetDocuments = () => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  const { id, segmentos: rawSegmentos, ...rest } = searchParams || {};

  const segmentos = rawSegmentos
    ? rawSegmentos
        .split(',')
        .map(Number)
        .filter((n) => !isNaN(n))
    : undefined;

  return documentsService.getAll.useQuery(
    {
      ...rest,
      ...(segmentos && segmentos.length > 0 ? { segmentos } : {}),
    },
    {
      staleTime: 3000,
    },
  );
};

export type TuseGetDocuments = ReturnType<typeof useGetDocuments>;
