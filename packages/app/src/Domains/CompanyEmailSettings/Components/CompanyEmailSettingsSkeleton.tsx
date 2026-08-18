import { Skeleton } from '@app/Application/Components/ui/skeleton';
import { Container } from '@app/Application';

export const CompanyEmailSettingsSkeleton = () => (
  <Container
    className="company-email-settings ces-panel p-4 md:p-6"
    space="large"
  >
    <Container row justify="between" align="center">
      <Container space="small">
        <Skeleton className="h-4 w-28 bg-white/10" />
        <Skeleton className="h-10 w-56 bg-white/10" />
      </Container>
      <Skeleton className="h-11 w-36 bg-white/10" />
    </Container>
    <Skeleton className="h-28 w-full bg-white/10" />
    <Container className="grid gap-3 md:grid-cols-2" space="small">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-24 w-full bg-white/10" />
      ))}
    </Container>
  </Container>
);
