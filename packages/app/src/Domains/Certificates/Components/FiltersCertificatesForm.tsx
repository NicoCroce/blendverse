import { Button, Container, Input, useURLParams } from '@app/Application';
import { Label } from '@app/Application/Components/ui/label';
import { SheetClose, SheetFooter } from '@app/Application/Components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/Application/Components/ui/select';
import { useState } from 'react';
import { TCertificatesSearch, TCertificateType } from '../Certificate.entity';
import { useGetCertificatesTypes } from '../Hooks';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@app/Application/Components/ui/toggle-group';
import clsx from 'clsx';
import { CertificateStatus } from '@server/domains/Certificates/Domain/Certificate.types';
import { SegmentsFilterField } from '@app/Domains/Segments';

const buttonGroupActiveClass =
  'data-[state=on]:!bg-primary data-[state=on]:!text-secondary';

const initialState: TCertificatesSearch = {
  type: undefined,
  date: undefined,
  employee: '',
  year: undefined,
  status: undefined,
};

const statusOptions = [
  {
    value: 'pendiente',
    label: 'Pendiente',
    color:
      'data-[state=on]:!bg-yellow-100 data-[state=on]:!text-yellow-800 data-[state=on]:!border-yellow-300',
  },
  {
    value: 'aprobado',
    label: 'Aprobado',
    color:
      'data-[state=on]:!bg-green-100 data-[state=on]:!text-green-800 data-[state=on]:!border-green-300',
  },
  {
    value: 'rechazado',
    label: 'Rechazado',
    color:
      'data-[state=on]:!bg-red-100 data-[state=on]:!text-red-800 data-[state=on]:!border-red-300',
  },
  {
    value: 'validando',
    label: 'Validando',
    color:
      'data-[state=on]:!bg-blue-100 data-[state=on]:!text-blue-800 data-[state=on]:!border-blue-300',
  },
  {
    value: 'eliminado',
    label: 'Eliminado',
    color:
      'data-[state=on]:!bg-gray-100 data-[state=on]:!text-gray-500 data-[state=on]:!border-gray-300',
  },
];

const toDateInputValue = (date?: string) => {
  if (!date) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().split('T')[0];
};

interface FiltersCertificatesFormProps {
  isAdmin?: boolean;
  availableYears: number[];
}

export const FiltersCertificatesForm = ({
  isAdmin = false,
  availableYears,
}: FiltersCertificatesFormProps) => {
  const { searchParams, updateParams } = useURLParams<TCertificatesSearch>();
  const [formState, setFormState] = useState<TCertificatesSearch>({
    ...initialState,
    ...searchParams,
  });

  const { data: certificatesTypes } = useGetCertificatesTypes();

  const handleChangeFilters = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleType = (value: string) => {
    setFormState((prev) => ({ ...prev, type: value }));
  };

  const handleYearChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      year: value === '__all__' ? undefined : value,
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      status: (value as CertificateStatus) || undefined,
    }));
  };

  const handleApplyFilters = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTimeout(() => {
      updateParams({ ...formState });
    }, 300);
  };

  const cleanFilters = () => setFormState({ ...initialState });

  return (
    <form className="grid gap-6 py-4" onSubmit={handleApplyFilters}>
      {isAdmin && (
        <Container space="small">
          <Label htmlFor="employee">Nombre</Label>
          <Input
            id="employee"
            name="employee"
            value={formState.employee}
            className="col-span-3"
            onChange={handleChangeFilters}
          />
        </Container>
      )}
      <Container space="small">
        <Label>Tipo</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          className="justify-start gap-4 flex-wrap"
          onValueChange={handleType}
          value={formState.type}
        >
          {certificatesTypes?.map(({ name, id }: TCertificateType) => (
            <ToggleGroupItem
              key={id}
              value={String(id)}
              className={clsx(
                'capitalize cursor-pointer',
                buttonGroupActiveClass,
              )}
            >
              {name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Container>
      <Container space="small">
        <Label htmlFor="date">Fecha</Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={toDateInputValue(formState.date)}
          className="col-span-3"
          onChange={handleChangeFilters}
        />
      </Container>
      <Container space="small">
        <Label>Año</Label>
        <Select value={formState.year ?? ''} onValueChange={handleYearChange}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Todos los años" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos los años</SelectItem>
            {availableYears.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Container>
      <Container space="small">
        <Label>Estado</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          className="justify-start gap-4 flex-wrap"
          onValueChange={handleStatusChange}
          value={formState.status}
        >
          {statusOptions.map(({ value, label, color }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className={clsx('cursor-pointer', buttonGroupActiveClass, color)}
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Container>
      <SegmentsFilterField />
      <SheetFooter className="mt-16">
        <Container row className="w-full sm:justify-end">
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
