import { Button, Container, useURLParams } from '@app/Application';
import { Input } from '@app/Application/Components/ui/input';
import { Label } from '@app/Application/Components/ui/label';
import {
  PENDING,
  VALIDATED,
  TDocumentSearch,
  TStateDocument,
} from '../../Document.entity';
import { useState } from 'react';
import { SheetClose, SheetFooter } from '@app/Application/Components/ui/sheet';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@app/Application/Components/ui/toggle-group';
import { useGetDocumentsTypes } from '../../Hooks/useGetDocumentsTypes';
import clsx from 'clsx';
import { SegmentsFilter } from '@app/Domains/Segments';

const initialState: TDocumentSearch = {
  title: '',
  state: PENDING,
  type: '',
};

const buttonGroupActiveClass =
  'data-[state=on]:!bg-primary data-[state=on]:!text-secondary';

export const FiltersDocumentsForm = () => {
  const { searchParams, updateParams } = useURLParams<TDocumentSearch>();
  const [formState, setFormState] = useState<TDocumentSearch>({
    ...initialState,
    ...searchParams,
  });
  const { data: documentsTypes } = useGetDocumentsTypes();

  const handleChangeFilters = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleState = (value: string) => {
    setFormState((prev) => ({ ...prev, state: value as TStateDocument }));
  };

  const handleType = (value: string) => {
    setFormState((prev) => ({ ...prev, type: value }));
  };

  const handleApplyFilters = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTimeout(() => {
      updateParams({ ...formState, id: undefined });
    }, 300);
  };

  const cleanFilters = () => setFormState(initialState);

  return (
    <form className="grid gap-6 py-4" onSubmit={handleApplyFilters}>
      <Container space="small">
        <Label htmlFor="title">Nombre del documento</Label>
        <Input
          id="title"
          name="title"
          value={formState.title}
          className="col-span-3"
          onChange={handleChangeFilters}
        />
      </Container>
      <Container space="small">
        <Label>Estado</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          className="justify-start gap-4"
          onValueChange={handleState}
          value={formState.state}
        >
          <ToggleGroupItem value={PENDING} className={buttonGroupActiveClass}>
            Pendientes
          </ToggleGroupItem>
          <ToggleGroupItem value={VALIDATED} className={buttonGroupActiveClass}>
            Validados
          </ToggleGroupItem>
        </ToggleGroup>
      </Container>
      <Container space="small">
        <Label>Tipo</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          className="justify-start gap-4 flex-wrap"
          onValueChange={handleType}
          value={formState.type}
        >
          {documentsTypes?.map((docType) => (
            <ToggleGroupItem
              key={docType.id}
              value={docType.denominacion}
              className={clsx('capitalize', buttonGroupActiveClass)}
            >
              {docType.denominacion}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Container>

      <Container space="small">
        <Label>Segmentos</Label>
        <SegmentsFilter />
      </Container>

      <SheetFooter className="mt-16">
        <Container row className="w-full" justify="end">
          <Button
            variant="outline"
            onClick={cleanFilters}
            className="w-full sm:w-auto"
          >
            Limpiar filtros
          </Button>
          <SheetClose asChild>
            <Button type="submit" className="w-full sm:w-auto">
              Aplicar filtros
            </Button>
          </SheetClose>
        </Container>
      </SheetFooter>
    </form>
  );
};
