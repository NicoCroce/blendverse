import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { useGetPostalcodes } from './Hooks/useGetPostalcodes';
import { SelectBase } from '../SelectBase';
import { useGetPostalcode } from '@app/Domains/Postalcodes';

interface SelectPostalcodeProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T>;
}

export const SelectPostalcode = <T extends FieldValues>({
  name,
  form,
}: SelectPostalcodeProps<T>) => {
  const [search, setSearch] = useState('');
  const { data: PostalcodeOptions, isLoading } = useGetPostalcodes(search);
  const { data: postalCode } = useGetPostalcode(Number(form.getValues(name)));

  const handleChangeFilter = (value: string) => setSearch(value);

  return (
    <SelectBase
      form={form}
      name={name}
      inputLabel="Códigos Postales"
      options={PostalcodeOptions}
      onChangeFilter={handleChangeFilter}
      isLoading={isLoading}
      isBig
      label={postalCode?.denominacion}
    />
  );
};
