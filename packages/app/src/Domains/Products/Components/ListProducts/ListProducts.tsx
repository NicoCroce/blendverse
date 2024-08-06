import { useGetProducts } from '../../Hooks';
import { DataTable } from '@app/Aplication/Components/DataTable';
import { columns } from './ColumnsProductsTable';
import { Skeleton } from '@app/Aplication/Components/ui/skeleton';

export const ListProducts = () => {
  const { data, isLoading } = useGetProducts();

  return (
    <div>
      {isLoading ? (
        <Skeleton className="w-full h-[300px] rounded-xl" />
      ) : (
        <DataTable columns={columns} data={data || []} />
      )}
    </div>
  );
};
