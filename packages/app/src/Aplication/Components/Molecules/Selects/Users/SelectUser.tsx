import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { useGetUsers } from './Hooks/useGetUsers';
import { SelectBase } from '../SelectBase';
interface SelectUserProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T>;
}

export const SelectUser = <T extends FieldValues>({
  name,
  form,
}: SelectUserProps<T>) => {
  const { data: UserOptions, isLoading } = useGetUsers();

  return (
    <SelectBase
      form={form}
      name={name}
      inputLabel="Usuarios"
      options={UserOptions}
      isLoading={isLoading}
      isBig={false}
    />
  );
};
