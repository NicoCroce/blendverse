import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from './useDebounce';

/**
 * This hook returns searchParams as an Object format and methods to update them.
 * You can use searchParams to get an object.
 * updateDebouncedParams use this method to update with delay.
 * updateDebouncedParams, use this method to update with out delay.
 *
 * @template {Record<string, string>} TParams
 * @param {?string} [baseURL] example '/catalog
 * @param {number} [debounceTime=300]
 * @returns {{ searchParams: any; updateDebouncedParams: any; updateParams: any; }}
 */
export const useURLParams = <TParams extends Record<string, string | number>>(
  baseURL?: string,
  debounceTime: number = 300,
) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // Define a new state than change from the component.
  const [urlSearchParams, updateDebouncedParams] = useState<
    Partial<Record<keyof TParams, string>>
  >({});
  // Send this value to debounce hook.
  const debouncedValue = useDebounce(urlSearchParams, debounceTime);

  const updateParams = useCallback(
    (params: Partial<Record<keyof TParams, string>>) => {
      // Get a new searchParams
      const newSearchParams = new URLSearchParams(searchParams);
      /** This verify the values of each keys. If the the value exists, 
      update the key else if the value doesn't exist, delete the key.
      */
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newSearchParams.set(key, value as string);
        } else {
          newSearchParams.delete(key);
        }
      });
      /* navigate
        Using navigate here updates the browser URL without reloading the page, 
        which is crucial for maintaining application state and providing a smooth 
        user experience.
      */
      navigate(`${baseURL}?${newSearchParams.toString()}`, {
        replace: true,
      });
      /* setSearchParams 
        Updates the search parameters in the internal state of React Router.
        Triggers a re-render of components that depend on these parameters.
        Does not cause a full navigation like navigate does.
      */
      setSearchParams(newSearchParams);
    },
    [baseURL, navigate, searchParams, setSearchParams],
  );

  useEffect(() => {
    // This execution updates the parameters on every change of the debounce value.
    if (Object.keys(debouncedValue).length > 0) {
      updateParams(debouncedValue);
    }
  }, [debouncedValue, updateParams]);

  /*
    This code return undefined or an object with each searchParams if params exists
  */
  const getSearchParams = useCallback(
    (): TParams | undefined =>
      searchParams.size === 0
        ? undefined
        : (Object.fromEntries(searchParams.entries()) as TParams),
    [searchParams],
  );

  /*
    You can use searchParams to get an object.
    updateDebouncedParams use this method to update with delay.
    updateDebouncedParams, use this method to update with out delay.
  */
  return {
    searchParams: getSearchParams(),
    updateDebouncedParams,
    updateParams,
  };
};
