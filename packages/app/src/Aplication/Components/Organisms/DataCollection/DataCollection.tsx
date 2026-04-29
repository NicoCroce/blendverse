import { useGlobalStore } from '@app/Aplication/Hooks';
import { DataList } from './DataList';
import { JSX } from 'react';

interface DataListProps<TData> {
  table: React.ReactNode;
  listComponent: ({ data }: { data: TData }) => JSX.Element;
  data: TData[];
  hasMore: boolean;
  isLoading?: boolean;
  currentPage: number;
}

export const DataCollection = <TData,>({
  table,
  listComponent,
  data,
  hasMore,
  isLoading,
  currentPage,
}: DataListProps<TData>) => {
  const { data: isMobile } = useGlobalStore('isMobile');

  return (
    <>
      {isMobile ? (
        <DataList
          data={data}
          component={listComponent}
          hasMore={hasMore}
          isLoading={isLoading}
          currentPage={currentPage}
        />
      ) : (
        table
      )}
    </>
  );
};
