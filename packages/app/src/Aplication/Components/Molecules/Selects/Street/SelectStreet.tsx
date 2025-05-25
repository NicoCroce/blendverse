import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { useGetStreets } from './Hooks/useGetStreets';
import { SelectBase } from '../SelectBase';

interface SelectStreetProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T>;
}

export const SelectStreet = <T extends FieldValues>({
  name,
  form,
}: SelectStreetProps<T>) => {
  const [search, setSearch] = useState('');
  const { data: StreetOptions, isLoading } = useGetStreets(search);

  const handleChangeFilter = (value: string) => setSearch(value);

  return (
    <SelectBase
      form={form}
      name={name}
      inputLabel="Calle"
      options={StreetOptions}
      onChangeFilter={handleChangeFilter}
      isLoading={isLoading}
      isBig
    />
  );
};
