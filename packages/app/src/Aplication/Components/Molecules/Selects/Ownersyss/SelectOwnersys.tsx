import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { useGetOwnersyss } from './Hooks/useGetOwnersyss';
import { SelectBase } from '../SelectBase';
interface SelectOwnersysProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T>;
}

export const SelectOwnersys = <T extends FieldValues>({
  name,
  form,
}: SelectOwnersysProps<T>) => {
  const [search, setSearch] = useState('');
  const { data: OwnersysOptions, isLoading } = useGetOwnersyss(search);

  const handleChangeFilter = (value: string) => setSearch(value);

  return (
    <SelectBase
      form={form}
      name={name}
      inputLabel="Sistema Propietarios"
      options={OwnersysOptions}
      onChangeFilter={handleChangeFilter}
      isLoading={isLoading}
      isBig
    />
  );
};
