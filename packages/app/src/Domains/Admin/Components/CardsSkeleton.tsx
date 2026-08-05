import { Container } from '@app/Application';
import { Skeleton } from '@app/Application/Components/ui/skeleton';

export const CardsSkeleton = () => (
  <Container space="small" className="md:hidden">
    {Array.from({ length: 5 }).map((_, i) => (
      <Container
        row
        align="start"
        className="gap-3 rounded-md border p-3"
        key={i}
      >
        <Skeleton className="size-5 rounded-sm shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
          </div>
        </div>
      </Container>
    ))}
  </Container>
);
