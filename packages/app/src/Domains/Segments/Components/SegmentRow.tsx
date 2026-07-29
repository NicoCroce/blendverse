import {
  Container,
  Text,
  Button,
  AlertDialogCancelConfirm,
} from '@app/Application';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { TSegmentType } from '../Domain/segments.types';

export const SegmentRow = ({
  segment,
  onEdit,
  onDelete,
}: {
  segment: TSegmentType;
  onEdit: (seg: TSegmentType) => void;
  onDelete: (id: number) => void;
}) => (
  <Container
    row
    align="center"
    justify="between"
    className="py-3 px-4 border-b last:border-b-0 hover:bg-muted/50 rounded-sm"
  >
    <Text>{segment.nombre}</Text>
    <Container row space="small">
      <Button
        variant="outline"
        onClick={() => onEdit(segment)}
        icon={faEdit}
        showIcon
      />
      <AlertDialogCancelConfirm onConfirm={() => onDelete(segment.id)}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" icon={faTrash} showIcon />
        </AlertDialogTrigger>
      </AlertDialogCancelConfirm>
    </Container>
  </Container>
);
