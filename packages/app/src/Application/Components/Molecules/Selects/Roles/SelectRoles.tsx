import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { SelectBase } from '../SelectBase';
import { useGetRoles } from '@app/Domains/Auth';
import { useMemo } from 'react';

interface SelectRolesProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T>;
}

export const SelectRoles = <T extends FieldValues>({
  name,
  form,
}: SelectRolesProps<T>) => {
  const { data, isLoading } = useGetRoles();

  const options = useMemo(
    () =>
      data?.map(({ name }) => ({
        value: name,
        label: `${name}`,
      })),
    [data],
  );

  return (
    <SelectBase
      form={form}
      name={name}
      inputLabel="Rol"
      options={options}
      isLoading={isLoading}
    />
  );
};
