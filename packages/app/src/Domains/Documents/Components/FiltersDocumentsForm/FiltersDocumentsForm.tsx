import { Button, Container, useURLParams } from '@app/Application';
import { Input } from '@app/Application/Components/ui/input';
import { Label } from '@app/Application/Components/ui/label';
import { PENDING, TDocumentSearch } from '../../Document.entity';
import { useState } from 'react';
import { SheetClose, SheetFooter } from '@app/Application/Components/ui/sheet';
import { SegmentsFilterField } from '@app/Domains/Segments';
import { DocumentsStateFilterField } from '../DocumentsStateFilterField';

const initialState: TDocumentSearch = {
  title: '',
  state: PENDING,
  type: '',
};

export const FiltersDocumentsForm = () => {
  const { searchParams, updateParams } = useURLParams<TDocumentSearch>();
  const [formState, setFormState] = useState<TDocumentSearch>({
    ...initialState,
    ...searchParams,
  });
  /*   const { data: documentsTypes } = useGetDocumentsTypes();
   */
  const handleChangeFilters = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  /*   const handleType = (value: string) => {
    setFormState((prev) => ({ ...prev, type: value }));
  }; */

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
      <DocumentsStateFilterField
        value={formState.state ?? PENDING}
        onChange={(value) =>
          setFormState((prev) => ({ ...prev, state: value }))
        }
      />
      {/* NOTE: En un futuro puede ser que se implemente por tipo de documentos por el momneto solo son recibos. */}
      {/*  <Container space="small">
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
      </Container> */}

      <SegmentsFilterField />

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
