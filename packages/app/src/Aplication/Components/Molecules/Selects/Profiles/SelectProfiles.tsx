import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { SelectBase } from '../SelectBase';
import { useGetProfilesSelect } from '@app/Domains/Profiles';
import { useMemo } from 'react';

interface SelectProfilesProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T>;
}

export const SelectProfiles = <T extends FieldValues>({
  name,
  form,
}: SelectProfilesProps<T>) => {
  const { data, isLoading } = useGetProfilesSelect();

  const options = useMemo(
    () =>
      data?.map(({ value, label }) => ({
        value,
        label,
      })),
    [data],
  );

  return (
    <SelectBase
      form={form}
      name={name}
      inputLabel="Perfil"
      options={options}
      isLoading={isLoading}
    />
  );
};
