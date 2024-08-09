import { useGetProducts } from '../../Hooks';
import { DataTable } from '@app/Aplication/Components/DataTable';
import { columns } from './ColumnsProductsTable';
import { DataCollection } from '@app/Aplication/Components/DataCollection';
import { ProductComponentList } from './ProductComponentList';

export const ListProducts = () => {
  const { data } = useGetProducts();
  const safeData = data || [];

  return (
    <DataCollection
      table={<DataTable columns={columns} data={safeData} />}
      listComponent={ProductComponentList}
      data={safeData}
    />
  );
};
