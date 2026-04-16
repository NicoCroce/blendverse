import { Link, To } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AlertDialogCancelConfirm } from '@app/Aplication';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import { Container } from '@app/Aplication/Components/Layout/Container';

interface EditDeleteProps {
  editPath: To;
  onDelete: () => void;
}

export const EditDelete = ({ editPath, onDelete }: EditDeleteProps) => (
  <Container
    row
    align="center"
    justify="end"
    space="small"
    className="shrink-0 md:gap-4"
  >
    <Link
      to={editPath}
      className="py-1 px-2 bg-accent text-primary rounded-full"
    >
      <FontAwesomeIcon icon={faEdit} />
    </Link>
    <AlertDialogCancelConfirm onConfirm={onDelete}>
      <AlertDialogTrigger asChild>
        <FontAwesomeIcon
          icon={faTrash}
          className="cursor-pointer text-red-800 p-2 px-[9px] bg-destructive-foreground rounded-full"
        />
      </AlertDialogTrigger>
    </AlertDialogCancelConfirm>
  </Container>
);
