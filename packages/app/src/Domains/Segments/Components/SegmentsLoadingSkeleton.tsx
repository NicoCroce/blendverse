import { Skeleton } from '@app/Application/Components/ui/skeleton';

export const SegmentsLoadingSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-16 w-full rounded-xl" />
    ))}
  </div>
);
