import { Skeleton } from '@app/Application/Components/ui/skeleton';

export const TableSkeleton = () => (
  <div className="rounded-md border divide-y">
    <div className="p-4">
      <Skeleton className="h-4 w-3/4" />
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="p-4 flex gap-4">
        <Skeleton className="size-4 rounded-sm shrink-0" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
    ))}
  </div>
);
