import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Container } from '@app/Application';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@app/Application/Components/ui/alert-dialog';
import { useGetSegmentTypes } from '../Hooks/useGetSegmentTypes';
import { useDeleteSegmentType } from '../Hooks/useDeleteSegmentType';
import type { TSegmentType } from '../Segments.entity';
import { SegmentsLoadingSkeleton } from './SegmentsLoadingSkeleton';
import { SegmentsEmptyState } from './SegmentsEmptyState';
import { SegmentInlineName } from './SegmentInlineName';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export const SegmentsManager = () => {
  const { data: segments, isLoading } = useGetSegmentTypes();
  const deleteMutation = useDeleteSegmentType();
  const [deleteTarget, setDeleteTarget] = useState<TSegmentType | null>(null);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { id: deleteTarget.id },
      {
        onSuccess: () => {
          toast.success('Segmento eliminado');
          setDeleteTarget(null);
        },
        onError: (err) => {
          toast.error(err.message ?? 'Error al eliminar');
        },
      },
    );
  };

  if (isLoading) return <SegmentsLoadingSkeleton />;

  return (
    <Container space="medium">
      {segments && segments.length > 0 ? (
        <div className="space-y-2">
          {segments.map((seg) => (
            <Container
              row
              align="center"
              justify="between"
              key={seg.id}
              className="group rounded-xl border bg-card px-5 py-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              <Container
                row
                align="center"
                space="medium"
                className="min-w-0 flex-1"
              >
                <span className="flex size-2 shrink-0 rounded-full bg-primary/40" />
                <div className="min-w-0 flex-1">
                  <SegmentInlineName segment={seg} />
                </div>
              </Container>

              <AlertDialog
                open={deleteTarget?.id === seg.id}
                onOpenChange={(open) => {
                  if (!open) setDeleteTarget(null);
                }}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    onClick={() => setDeleteTarget(seg)}
                    aria-label={`Eliminar ${seg.nombre}`}
                    icon={faTrash}
                    showIcon
                    variant="ghost"
                  />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      ¿Eliminar «{seg.nombre}»?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Se van a eliminar las asignaciones de este segmento a
                      todos los usuarios. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex flex-row gap-4 items-end justify-end">
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteConfirm}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Container>
          ))}
        </div>
      ) : (
        <SegmentsEmptyState />
      )}
    </Container>
  );
};
