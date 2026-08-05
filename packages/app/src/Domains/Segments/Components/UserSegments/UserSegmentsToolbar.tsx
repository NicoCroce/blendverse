import { Input, Container } from '@app/Application';
import { Checkbox } from '@app/Application/Components/ui/checkbox';
import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { cn } from '@app/Application/lib/utils';
import { SegmentsFilterField } from '../SegmentsFilterField';

export const UserSegmentsToolbar = ({
  search,
  onSearchChange,
  withoutSegments,
  onWithoutSegmentsChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  withoutSegments: boolean;
  onWithoutSegmentsChange: (value: boolean) => void;
}) => (
  <Container row className="flex-col sm:flex-row gap-3">
    <div className="relative flex-1">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={search}
        placeholder="Buscar por nombre, apellido o email..."
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9"
        aria-label="Buscar empleado"
      />
      {search && (
        <button
          type="button"
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <Cross2Icon className="size-4" />
        </button>
      )}
    </div>
    <label
      className={cn(
        'flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer text-sm transition-colors',
        withoutSegments && 'border-primary bg-primary/5',
      )}
    >
      <Checkbox
        checked={withoutSegments}
        onCheckedChange={(checked) => onWithoutSegmentsChange(Boolean(checked))}
      />
      Sin segmento asignado
    </label>
    <div className="w-full sm:w-64">
      <SegmentsFilterField showLabel={false} />
    </div>
  </Container>
);
