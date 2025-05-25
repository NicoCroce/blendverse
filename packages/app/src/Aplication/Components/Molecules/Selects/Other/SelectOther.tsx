import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { useGetAllStreets } from './Hooks/useGetStreets';
import { SelectBase } from '../SelectBase';

interface SelectOtherProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T>;
}

export const SelectOther = <T extends FieldValues>({
  name,
  form,
}: SelectOtherProps<T>) => {
  const { data: StreetOptions, isLoading } = useGetAllStreets();

  return (
    <SelectBase
      form={form}
      name={name}
      inputLabel="Otro"
      options={StreetOptions}
      isLoading={isLoading}
    />
  );
};
