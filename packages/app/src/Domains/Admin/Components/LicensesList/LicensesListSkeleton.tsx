import { Container } from '@app/Application';
import { Skeleton } from '@app/Application/Components/ui/skeleton';

export const LicensesListSkeleton = () => (
  <Container space="small">
    {Array.from({ length: 4 }).map((_, index) => (
      <Skeleton key={index} className="h-32 w-full rounded-xl" />
    ))}
  </Container>
);
