import { useEffect, useRef } from 'react';
import { useURLParams } from './useURLParams';

const INIT_NUMBER_PAGE = 10;
const ADD_NUMBER_PAGE = 10;

interface UsePaginationIntersectionProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore?: () => void;
}

export const usePaginationIntersection = ({
  hasMore,
  isLoading,
  onLoadMore,
}: UsePaginationIntersectionProps) => {
  const observerRef = useRef<HTMLDivElement>(null);
  const { updateParams } = useURLParams();

  useEffect(() => {
    const currentObserverRef = observerRef.current; // Capturar referencia para cleanup

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          // Leer directamente del hash porque usas React Router con hash routing
          const hash = window.location.hash; // "#/users?limit=10"
          const queryString = hash.split('?')[1] || ''; // "limit=10"
          const urlParams = new URLSearchParams(queryString);
          const currentLimit = urlParams.get('limit');

          const newLimit =
            (Number(currentLimit) || INIT_NUMBER_PAGE) + ADD_NUMBER_PAGE;

          onLoadMore?.();
          updateParams({ limit: newLimit });
        }
      },
      {
        threshold: 1.0,
        rootMargin: '200px',
      },
    );

    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [hasMore, isLoading, onLoadMore, updateParams]);

  return { observerRef };
};
