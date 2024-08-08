import { useQuery, useQueryClient, Updater } from '@tanstack/react-query';

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
  const setQueryData = (updater: QueryDataUpdater<TData>) =>
    queryClient.setQueryData<TData>([queryKey], updater);

  const query = useQuery<TData>({ queryKey: [queryKey] });

  return {
    setQueryData,
    ...query,
  };
};
