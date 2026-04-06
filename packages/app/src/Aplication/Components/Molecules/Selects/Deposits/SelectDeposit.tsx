import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { useGetDeposits } from './Hooks/useGetDeposits';
import { SelectBase } from '../SelectBase';
import { useGetDeposit } from '@app/Domains/Deposits';

interface SelectDepositProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T>;
}

export const SelectDeposit = <T extends FieldValues>({
  name,
  form,
}: SelectDepositProps<T>) => {
  const [search, setSearch] = useState('');
  const { data: DepositOptions, isLoading } = useGetDeposits(search);
  const { data: deposit } = useGetDeposit(Number(form.getValues(name)));

  const handleChangeFilter = (value: string) => setSearch(value);

  return (
    <SelectBase
      form={form}
      name={name}
      inputLabel="Depósitos"
      options={DepositOptions}
      onChangeFilter={handleChangeFilter}
      isLoading={isLoading}
      isBig={false}
      label={deposit?.descripcion}
    />
  );
};
