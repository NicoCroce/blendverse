import { useEffect, useMemo, useRef, useState } from 'react';
import { TDocument, TDocumentSearch } from '../Document.entity';
import { documentsService } from '../Documents.service';
import { useCacheDocuments } from './useCacheDocuments';
import { useURLParams } from '@app/Application';

export const useGetDocument = (id: string | undefined) => {
  const [currentDocument, setCurrentDocument] = useState<TDocument | null>(
    null,
  );
  const queryDocument = documentsService.get.useQuery(Number(id), {
    enabled: false,
  });
  const { searchParams } = useURLParams<TDocumentSearch>();

  const cacheDocumentsList = useCacheDocuments();
  const { isFetching, refetch } = queryDocument;
  // Rastrea el último id ya gestionado para evitar fetches duplicados
  // y permitir refetch cuando el id cambia (aunque ya haya sido fetched antes).
  const lastHandledId = useRef<string | undefined>(undefined);

  // Extraemos los datos de la caché si es que existe.
  const cachedDocuments = useMemo(() => {
    const {
      id: paramId,
      segmentos: rawSegmentos,
      ...rest
    } = searchParams || {};

    const segmentos = rawSegmentos
      ? rawSegmentos
          .split(',')
          .map(Number)
          .filter((n) => !isNaN(n))
      : undefined;

    return cacheDocumentsList
      .getData({
        ...rest,
        ...(segmentos && segmentos.length > 0 ? { segmentos } : {}),
      })
      ?.find((document) => document.id === Number(paramId));
  }, [cacheDocumentsList, searchParams]);

  useEffect(() => {
    if (!searchParams?.id) {
      lastHandledId.current = undefined;
      const timer = setTimeout(() => setCurrentDocument(null), 0);
      return () => clearTimeout(timer);
    }

    // Si el documento está en caché, lo usamos, de lo contrario, hacemos fetch
    if (cachedDocuments) {
      lastHandledId.current = searchParams.id;
      const timer = setTimeout(() => setCurrentDocument(cachedDocuments), 0);
      return () => clearTimeout(timer);
    } else if (!isFetching && id && id !== lastHandledId.current) {
      lastHandledId.current = id;
      refetch().then((res) => {
        setCurrentDocument(res.data || null);
      });
    }
  }, [id, isFetching, refetch, cachedDocuments, searchParams]);

  return {
    currentDocument,
    ...queryDocument,
  };
};
