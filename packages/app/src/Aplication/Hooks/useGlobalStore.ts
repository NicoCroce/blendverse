import { useQuery, useQueryClient, Updater } from '@tanstack/react-query';
import { useCallback } from 'react';

type QueryDataUpdater<TData> = Updater<TData | undefined, TData>;

/**
 * @param queryKey - The key used to save or get data from global store.
 */
export const useGlobalStore = <TData>(queryKey: string) => {
  const queryClient = useQueryClient();

  /**
   *
   * @param updater - callback for set new value.  (currentValue) => newValue
   * @returns void
   */
  const setQueryData = useCallback(
    (updater: QueryDataUpdater<TData>) => {
      console.log('[setQueryData] Triggered for', queryKey);
      return queryClient.setQueryData<TData>([queryKey], updater);
    },
    [queryClient, queryKey], // solo cambia si estos cambian
  );

  const query = useQuery<TData>({ queryKey: [queryKey] });

  return {
    setQueryData,
    ...query,
  };
};
