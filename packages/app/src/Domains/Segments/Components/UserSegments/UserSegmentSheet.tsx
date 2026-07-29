import { useMemo, useCallback } from 'react';
import { Text, Button } from '@app/Application';
import { Badge } from '@app/Application/Components/ui/badge';
import { Skeleton } from '@app/Application/Components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@app/Application/Components/ui/sheet';
import { Cross2Icon } from '@radix-ui/react-icons';
import {
  useGetSegmentTypes,
  useGetUserSegments,
  useAssignSegmentToUser,
  useRemoveSegmentFromUser,
  segmentsTRPC,
} from '../../Application/segments.queries';
import { _disclaimerService } from '@app/Domains/Disclaimer/Disclaimer.service';
import type { Employee } from './types';

export const UserSegmentSheet = ({
  user,
  open,
  onOpenChange,
}: {
  user: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { data: userSegments, isLoading: segsLoading } = useGetUserSegments({
    userId: user.id,
  });
  const { data: allSegments } = useGetSegmentTypes();
  const assignMutation = useAssignSegmentToUser();
  const removeMutation = useRemoveSegmentFromUser();
  const segUtils = segmentsTRPC.useUtils();
  const discUtils = _disclaimerService.useUtils();

  const invalidateQueries = useCallback(() => {
    segUtils.segments.getUserSegments.invalidate({ userId: user.id });
    discUtils.disclaimer.getEmployees.invalidate();
  }, [segUtils, discUtils, user.id]);

  const userSegmentIds = useMemo(
    () => new Set(userSegments?.map((s) => s.id) ?? []),
    [userSegments],
  );

  const available = useMemo(
    () =>
      userSegments
        ? (allSegments ?? []).filter((s) => !userSegmentIds.has(s.id))
        : [],
    [allSegments, userSegmentIds, userSegments],
  );

  const handleAssign = useCallback(
    (segmentId: number) => {
      assignMutation.mutate(
        { userId: user.id, segmentId },
        { onSuccess: invalidateQueries },
      );
    },
    [assignMutation, user.id, invalidateQueries],
  );

  const handleRemove = useCallback(
    (segmentId: number) => {
      removeMutation.mutate(
        { userId: user.id, segmentId },
        { onSuccess: invalidateQueries },
      );
    },
    [removeMutation, user.id, invalidateQueries],
  );

  let assignedSegmentsContent: React.ReactNode;
  if (segsLoading) {
    assignedSegmentsContent = (
      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
    );
  } else if (userSegments && userSegments.length > 0) {
    assignedSegmentsContent = (
      <div className="flex flex-wrap gap-2">
        {userSegments.map((seg) => (
          <Badge
            key={seg.id}
            variant="secondary"
            className="gap-1.5 pr-1.5 text-sm"
          >
            {seg.nombre}
            <button
              type="button"
              onClick={() => handleRemove(seg.id)}
              disabled={removeMutation.isPending}
              className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
              aria-label={`Quitar ${seg.nombre}`}
            >
              <Cross2Icon className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
    );
  } else {
    assignedSegmentsContent = (
      <Text.Muted className="text-sm">Sin segmentos asignados</Text.Muted>
    );
  }

  let addSegmentContent: React.ReactNode;
  if (segsLoading) {
    addSegmentContent = (
      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    );
  } else if (available.length === 0) {
    addSegmentContent = (
      <div className="rounded-lg border border-dashed p-4 text-center">
        <Text.Muted className="text-sm">
          El usuario ya tiene todos los segmentos disponibles
        </Text.Muted>
      </div>
    );
  } else {
    addSegmentContent = (
      <div className="flex flex-wrap gap-2">
        {available.map((seg) => (
          <Button
            key={seg.id}
            variant="outline"
            size="sm"
            onClick={() => handleAssign(seg.id)}
            disabled={assignMutation.isPending}
            className="gap-1"
          >
            {seg.nombre}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-xl">
            {user.nombre} {user.apellido}
          </SheetTitle>
          <SheetDescription>{user.email}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Text className="text-sm font-medium text-foreground">
                Segmentos asignados
              </Text>
              {userSegments && (
                <Badge variant="outline" className="text-xs">
                  {userSegments.length}
                </Badge>
              )}
            </div>

            {assignedSegmentsContent}
          </div>

          <div className="border-t pt-6">
            <Text className="text-sm font-medium text-foreground mb-3">
              Agregar segmento
            </Text>
            {addSegmentContent}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
