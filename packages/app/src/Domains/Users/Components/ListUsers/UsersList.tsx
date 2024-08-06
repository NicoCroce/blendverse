import { useGetUsers } from '../../Hooks';
import { columns } from './ColumnsUsersTable';
import { DataTable } from '../../../../Aplication/Components/DataTable';

export const UsersList = () => {
  const { data, isLoading } = useGetUsers();

  return (
    <>
      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div className="w-full">
          <DataTable columns={columns} data={data || []} />
        </div>
      )}
    </>
  );
};
