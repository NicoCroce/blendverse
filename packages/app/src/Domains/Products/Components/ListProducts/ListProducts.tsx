import { useGetProducts } from '../../Hooks';
import { DataTable } from '@app/Aplication/Components/DataTable';
import { columns } from './ColumnsProductsTable';

export const ListProducts = () => {
  const { data, isLoading } = useGetProducts();

  return (
    <div>
      {isLoading ? (
        <h3>Loading...</h3>
      ) : (
        <div className="container mx-auto py-10">
          <DataTable columns={columns} data={data || []} />
        </div>
      )}
    </div>
  );
};
