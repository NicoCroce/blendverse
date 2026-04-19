import { Row } from '@tanstack/react-table';
import { To } from 'react-router-dom';
import { TUser } from '../../User.entity';
import { useDeleteUser } from '../../Hooks';
import { USERS_UPDATE_ROUTE } from '../../Users.routes';
import { EditDelete } from '@app/Aplication/Components/Organisms/EditDelete';

export const ActionsUsers = ({ row }: { row: Row<TUser> }) => {
  const { mutate } = useDeleteUser();
  const detailPath = (id: string): To => USERS_UPDATE_ROUTE.replace(':id', id);

  return (
    <EditDelete
      editPath={detailPath(row.getValue('id'))}
      onDelete={() => mutate(Number(row.getValue('id')))}
    />
  );
};
