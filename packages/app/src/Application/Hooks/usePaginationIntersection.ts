import { useEffect, useRef } from 'react';
import { useURLParams } from './useURLParams';
import { TPagination } from '../Helpers';

const INIT_NUMBER_PAGE = 10;

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
  const isFetchingRef = useRef(false);
  const currentPageRef = useRef(
    (() => {
      const hash = window.location.hash;
      const queryString = hash.split('?')[1] || '';
      return Number(new URLSearchParams(queryString).get('page')) || 1;
    })(),
  );
  const { updateParams } = useURLParams<TPagination>();

  useEffect(() => {
    if (!isLoading) isFetchingRef.current = false;
  }, [isLoading]);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    // El IntersectionObserver siempre dispara un callback inmediato al llamar
    // observe() reportando el estado inicial. Ignoramos esa primera llamada para
    // evitar que un refresh incremente la página automáticamente.
    let skipInitialFire = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (skipInitialFire) {
          skipInitialFire = false;
          return;
        }
        if (!entry.isIntersecting || isFetchingRef.current) return;
        isFetchingRef.current = true;

        currentPageRef.current += 1;
        onLoadMore?.();
        updateParams({ limit: INIT_NUMBER_PAGE, page: currentPageRef.current });
      },
      { threshold: 1.0, rootMargin: '200px' },
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore, updateParams]);

  return { observerRef };
};
