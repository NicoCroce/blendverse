import { Text } from '@app/Application';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

const EMPTY_STATE_CONTENT = {
  search: {
    title: (term: string) => `Sin resultados para «${term}»`,
    description: 'Probá con otro término de búsqueda',
  },
  withoutSegments: {
    title: 'Todos los empleados tienen segmentos asignados',
    description: 'Desmarcá el filtro para ver todos los empleados',
  },
  segmentFilter: {
    title: 'Ningún empleado en los segmentos seleccionados',
    description: 'Limpiá el filtro de segmentos para ver todos los empleados',
  },
  default: {
    title: 'No hay empleados',
    description: 'Todavía no hay empleados dados de alta',
  },
} as const;

const getEmptyStateKey = ({
  hasSearch,
  withoutSegments,
  hasSegmentFilter,
}: {
  hasSearch: boolean;
  withoutSegments: boolean;
  hasSegmentFilter: boolean;
}): keyof typeof EMPTY_STATE_CONTENT => {
  if (hasSearch) return 'search';
  if (withoutSegments) return 'withoutSegments';
  if (hasSegmentFilter) return 'segmentFilter';
  return 'default';
};

export const UserSegmentsEmptyState = ({
  hasSearch,
  searchTerm,
  hasSegmentFilter,
  withoutSegments,
}: {
  hasSearch: boolean;
  searchTerm: string;
  hasSegmentFilter: boolean;
  withoutSegments: boolean;
}) => {
  const key = getEmptyStateKey({
    hasSearch,
    withoutSegments,
    hasSegmentFilter,
  });
  const content = EMPTY_STATE_CONTENT[key];
  const title =
    typeof content.title === 'function'
      ? content.title(searchTerm)
      : content.title;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
        <MagnifyingGlassIcon className="size-6 text-muted-foreground" />
      </div>
      <Text className="text-base font-medium">{title}</Text>
      <Text.Muted className="mt-1 max-w-sm">{content.description}</Text.Muted>
    </div>
  );
};
