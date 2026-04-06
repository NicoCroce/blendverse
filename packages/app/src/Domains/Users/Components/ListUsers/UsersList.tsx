import { DataTable } from '@app/Aplication/Components/Organisms/DataCollection/DataTable';
import { DataCollection } from '@app/Aplication/Components/Organisms/DataCollection/DataCollection';
import { useGetUsers } from '../../Hooks';
import { columns } from './ColumnsUsersTable';
import { initPagination } from '@app/Aplication';
import { UserCard } from './UserCard';

export const UsersList = () => {
  const { data, isLoading, isFetching } = useGetUsers();

  return (
    <DataCollection
      data={data?.data || []}
      isLoading={isFetching}
      listComponent={UserCard}
      hasMore={data?.meta.hasMore || false}
      currentPage={data?.meta.currentPage || 1}
      table={
        isLoading && !data ? (
          <DataTable.Skeleton />
        ) : (
          <DataTable
            columns={columns}
            data={data?.data || []}
            pagination={data?.meta || initPagination}
          />
        )
      }
    />
  );
};
