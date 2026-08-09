import { useMemo, useState } from 'react';
import {
  Container,
  EmptyScreenError,
  EmptyScreenFilter,
  EmptyState,
  Input,
  List,
} from '@app/Application';
import { MagnifyingGlassIcon, Cross2Icon } from '@radix-ui/react-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Document } from '../Document';
import { ScrollArea } from '@app/Application/Components/ui/scroll-area';
import { DocumentsListSkeleton } from './DocumentsListSkeleton';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@app/Application/Components/ui/accordion';
import { TuseGetDocumentsByCompany } from '@app/Domains/Admin';

interface DocumentsListProps {
  openFilters: () => void;
  service: TuseGetDocumentsByCompany;
  filteredUserIds?: Set<number>;
}

export const DocumentsListByUser = ({
  openFilters,
  service,
  filteredUserIds,
}: DocumentsListProps) => {
  const { data, isLoading, isError, error } = service;
  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!data) return data;
    let result = data;
    if (filteredUserIds && filteredUserIds.size > 0) {
      result = result.filter((entry) => filteredUserIds.has(entry.userId));
    }
    if (result.length === 0) return result;
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return result;
    return result.filter((entry) => entry.user.toLowerCase().includes(trimmed));
  }, [data, query, filteredUserIds]);

  if (isError) {
    return <EmptyScreenError message={error?.message} />;
  }

  if (isLoading) {
    return <DocumentsListSkeleton />;
  }

  const hasSegmentFilter =
    filteredUserIds !== undefined && filteredUserIds.size > 0;

  if (data && !data.length) return <EmptyScreenFilter onClick={openFilters} />;

  return data ? (
    <>
      <Container className="sticky top-0 z-1 bg-slate-50 pb-2">
        <Container className="relative w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            value={query}
            placeholder="Buscar por empleado"
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9"
            aria-label="Buscar por empleado"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Limpiar búsqueda"
            >
              <Cross2Icon className="size-4" />
            </button>
          )}
        </Container>
      </Container>
      {filteredData && filteredData.length ? (
        <ScrollArea className="h-[74vh] w-full">
          <List>
            {filteredData.map(({ userId, user, documents }, index) => {
              return (
                <List.Li key={userId}>
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="item-0"
                    className="cursor-pointer"
                  >
                    <AccordionItem
                      value={`item-${index}`}
                      className="cursor-pointer"
                    >
                      <AccordionTrigger className="px-4 cursor-pointer">
                        {user}
                      </AccordionTrigger>
                      <AccordionContent>
                        <List>
                          {documents.map((document) => (
                            <List.Li key={document.id}>
                              <Document {...document} />
                            </List.Li>
                          ))}
                        </List>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </List.Li>
              );
            })}
          </List>
        </ScrollArea>
      ) : (
        <EmptyState
          icon={faMagnifyingGlass}
          title={
            hasSegmentFilter
              ? 'No hay empleados en los segmentos seleccionados'
              : `Sin resultados para «${query}»`
          }
          description={
            hasSegmentFilter
              ? 'Limpiá el filtro de segmentos para ver todos los empleados'
              : 'Probá con otro término de búsqueda'
          }
        />
      )}
    </>
  ) : null;
};
