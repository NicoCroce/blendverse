import { useGetUsers } from '../../Hooks';
import { columns } from './ColumnsUsersTable';
import { DataTable } from './DataTable';

export const UsersList = () => {
  const { data, isLoading } = useGetUsers();

  return (
    <>
      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div className="container mx-auto py-10">
          <DataTable columns={columns} data={data || []} />
        </div>
      )}
    </>
  );
};
