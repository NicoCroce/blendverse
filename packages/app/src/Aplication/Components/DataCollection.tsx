import { useGlobalStore } from '../Hooks';
import { DataList } from './DataList';
import { DataTable } from './DataTable';

interface DataListProps<TData> {
  table: React.ReactNode;
  listComponent: ({ data }: { data: TData }) => JSX.Element;
  data: TData[];
}

export const DataCollection = <TData,>({
  table,
  listComponent,
  data,
}: DataListProps<TData>) => {
  const { data: isMobile } = useGlobalStore('isMobile');
  if (data.length === 0) {
    return isMobile ? <DataList.Skeleton /> : <DataTable.Skeleton />;
  }
  return (
    <>{isMobile ? <DataList data={data} component={listComponent} /> : table}</>
  );
};
