import { Container } from '@app/Application';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

export const EmpleadosEmptyState = ({ search }: { search: string }) => (
  <Container align="center" justify="center" className="py-16 text-center">
    <Container
      row
      align="center"
      justify="center"
      className="mb-4 size-14 rounded-full bg-muted"
    >
      <MagnifyingGlassIcon className="size-6 text-muted-foreground" />
    </Container>
    <p className="text-base font-medium">
      {search ? `Sin resultados para «${search}»` : 'No hay empleados'}
    </p>
    <p className="text-sm text-muted-foreground mt-1">
      {search
        ? 'Probá con otro término de búsqueda'
        : 'Todavía no hay empleados en el sistema'}
    </p>
  </Container>
);
