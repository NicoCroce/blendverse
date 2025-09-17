import { useGetUsers } from '../../Hooks';
import { DataList, useAccumulatedData } from '@app/Aplication';
import { UserItem } from './UserItem';

export const UsersList = () => {
  const { data, isFetching } = useGetUsers();

  // Usar el hook personalizado para acumular datos
  const { accumulatedData: accumulatedUsers } = useAccumulatedData({
    data: data?.data,
  });

  return (
    <div className="w-full">
      <DataList
        data={accumulatedUsers}
        component={UserItem}
        isLoading={isFetching}
        hasMore={data?.meta?.hasMore} // Usar el campo hasMore del servidor
      />
    </div>
  );
};
