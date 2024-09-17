import { Row } from '@tanstack/react-table';
import { Link, To } from 'react-router-dom';
import { USERS_UPDATE } from '../../UsersRoutes';
import { useDeleteUser } from '../../Hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AlertDialogCancelConfirm } from '@app/Aplication';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TUser } from '../../User.entity';

export const ActionsUsers = ({ row }: { row: Row<TUser> }) => {
  const { mutate } = useDeleteUser();
  const handleDelete = (id: string) => mutate(id);
  const detailPath = (id: string): To => USERS_UPDATE.replace(':id', id);

  return (
    <div className="flex gap-4 justify-end items-center">
      <Link to={detailPath(row.getValue('id'))}>
        <FontAwesomeIcon icon={faEdit} />
      </Link>
      <AlertDialogCancelConfirm
        onConfirm={() => {
          console.log(row.getValue('id'));
          handleDelete(row.getValue('id'));
        }}
      >
        <AlertDialogTrigger asChild>
          <FontAwesomeIcon icon={faTrash} className="cursor-pointer" />
        </AlertDialogTrigger>
      </AlertDialogCancelConfirm>
    </div>
  );
};
