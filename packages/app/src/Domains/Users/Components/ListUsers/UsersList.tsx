import { DataTable } from '@app/Aplication/Components/Organisms/DataCollection/DataTable';
import { useGetUsers } from '../../Hooks';
import { columns } from './ColumnsUsersTable';

export const UsersList = () => {
  const { data, isLoading } = useGetUsers();

  return (
    <>
      {isLoading ? (
        <DataTable.Skeleton />
      ) : (
        <div className="w-full">
          <DataTable columns={columns} data={data || []} />
        </div>
      )}
    </>
  );
};
