import { useState, useMemo } from 'react';
import { Button } from '@app/Application/Components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@app/Application/Components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@app/Application/Components/ui/popover';
import { Checkbox } from '@app/Application/Components/ui/checkbox';
import { Label } from '@app/Application/Components/ui/label';
import { Container, useURLParams } from '@app/Application';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faLayerGroup,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@app/Application/lib/utils';
import { useGetSegmentTypes } from '../Application/segments.queries';

type SegmentsFilterParams = {
  segmentos?: string;
};

export const SegmentsFilter = () => {
  const [open, setOpen] = useState(false);
  const { data: segments, isLoading } = useGetSegmentTypes();
  const { searchParams, updateParams } = useURLParams<SegmentsFilterParams>();

  const segmentIds = useMemo(() => {
    const raw = searchParams?.segmentos;
    if (!raw) return [];
    return raw
      .split(',')
      .map(Number)
      .filter((n) => !isNaN(n));
  }, [searchParams?.segmentos]);

  const toggleSegment = (id: number) => {
    const newIds = segmentIds.includes(id)
      ? segmentIds.filter((v) => v !== id)
      : [...segmentIds, id];
    updateParams({
      segmentos: newIds.length > 0 ? newIds.join(',') : undefined,
    });
  };

  const segmentPlural = segmentIds.length !== 1 ? 's' : '';
  const selectedText =
    segmentIds.length === 0
      ? 'Filtrar por segmentos'
      : `${segmentIds.length} segmento${segmentPlural} seleccionado${segmentPlural}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between cursor-pointer',
            segmentIds.length > 0 && 'border-primary',
          )}
        >
          <Container row align="center" space="small">
            <FontAwesomeIcon
              icon={faLayerGroup}
              className="size-4 text-muted-foreground"
            />
            <span className="truncate">{selectedText}</span>
          </Container>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="ml-2 h-4 w-4 shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-75 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar segmento..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Cargando...' : 'No hay segmentos'}
            </CommandEmpty>
            <CommandGroup>
              {segments?.map((seg) => {
                const isSelected = segmentIds.includes(seg.id);
                return (
                  <CommandItem
                    key={seg.id}
                    value={seg.nombre}
                    onSelect={() => toggleSegment(seg.id)}
                    className="cursor-pointer"
                  >
                    <Checkbox checked={isSelected} className="mr-2" />
                    <Label className="cursor-pointer flex-1">
                      {seg.nombre}
                    </Label>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          {segmentIds.length > 0 && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  updateParams({ segmentos: undefined });
                  setOpen(false);
                }}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2 size-3" />
                Limpiar filtro
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};
