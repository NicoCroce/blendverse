import { Link, To } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AlertDialogCancelConfirm } from '@app/Application';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import { Container } from '@app/Application/Components/Layout/Container';

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
      className="inline-flex items-center justify-center h-control w-control bg-accent text-primary rounded-full"
    >
      <FontAwesomeIcon icon={faEdit} />
    </Link>
    <AlertDialogCancelConfirm onConfirm={onDelete}>
      <AlertDialogTrigger asChild>
        <span className="cursor-pointer text-red-800 inline-flex items-center justify-center h-control w-control bg-destructive-foreground rounded-full">
          <FontAwesomeIcon icon={faTrash} />
        </span>
      </AlertDialogTrigger>
    </AlertDialogCancelConfirm>
  </Container>
);
