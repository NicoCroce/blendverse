import { Text, Container } from '@app/Application';
import { CreateSegmentDialog } from './CreateSegmentDialog';

export const SegmentsEmptyState = () => (
  <Container
    align="center"
    justify="center"
    className="rounded-xl border-2 border-dashed py-20 px-6 text-center"
  >
    <Container
      row
      align="center"
      justify="center"
      className="mb-5 size-14 rounded-full bg-muted"
    >
      <svg
        className="size-6 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 6h.008v.008H6V6Z"
        />
      </svg>
    </Container>
    <Text className="text-base font-medium">Todavía no hay segmentos</Text>
    <Text.Muted className="mt-1 mb-5 max-w-xs">
      Los segmentos agrupan usuarios para organizar el acceso a documentos. Creá
      el primero para empezar.
    </Text.Muted>
    <CreateSegmentDialog />
  </Container>
);
