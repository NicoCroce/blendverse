import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from './useDebounce';

export const useURLParams = <TParams extends Record<string, string>>(
  baseURL?: string,
  debounceTime: number = 300,
) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [urlSearchParams, updateDebouncedParams] = useState<
    Partial<Record<keyof TParams, string>>
  >({});
  const debouncedValue = useDebounce(urlSearchParams, debounceTime);

  const updateParams = useCallback(
    (params: Partial<Record<keyof TParams, string>>) => {
      const newSearchParams = new URLSearchParams(searchParams);

      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newSearchParams.set(key, value as string);
        } else {
          newSearchParams.delete(key);
        }
      });

      navigate(`${baseURL}?${newSearchParams.toString()}`, {
        replace: true,
      });
      setSearchParams(newSearchParams);
    },
    [baseURL, navigate, searchParams, setSearchParams],
  );

  useEffect(() => {
    if (Object.keys(debouncedValue).length > 0) {
      updateParams(debouncedValue);
    }
  }, [debouncedValue, updateParams]);

  const getSearchParams = useCallback(
    (): TParams | undefined =>
      searchParams.size === 0
        ? undefined
        : (Object.fromEntries(searchParams.entries()) as TParams),
    [searchParams],
  );

  const memoizedSearchParams = useMemo(
    () => getSearchParams(),
    [getSearchParams],
  );

  return {
    searchParams: memoizedSearchParams,
    updateDebouncedParams,
    updateParams,
  };
};
