import { Skeleton } from '@app/Application/Components/ui/skeleton';

export const CertificatesListSkeleton = () => (
  <div className="space-y-8">
    {Array.from({ length: 2 }).map((_, yearIdx) => (
      <div key={yearIdx} className="space-y-4">
        <div className="flex items-end gap-3 pb-3 border-b">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(200px,420px))]">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    ))}
  </div>
);
