import { EmptyState } from '@app/Application';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

export const EmpleadosEmptyState = ({ search }: { search: string }) => (
  <EmptyState
    icon={faMagnifyingGlass}
    title={search ? `Sin resultados para «${search}»` : 'No hay empleados'}
    description={
      search
        ? 'Probá con otro término de búsqueda'
        : 'Todavía no hay empleados en el sistema'
    }
  />
);
