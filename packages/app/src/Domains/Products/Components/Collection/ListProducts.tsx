import { useGetProducts } from '../../Hooks';
import { DataTable, DataCollection } from '@app/Aplication/Components';
import { columns } from './ColumnsProductsTable';
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
