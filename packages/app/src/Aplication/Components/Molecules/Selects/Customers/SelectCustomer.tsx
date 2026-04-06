import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { useGetCustomers } from './Hooks/useGetCustomers';
import { SelectBase } from '../SelectBase';
import { useGetCustomer } from '@app/Domains/Customers';
interface SelectCustomerProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T>;
}

export const SelectCustomer = <T extends FieldValues>({
  name,
  form,
}: SelectCustomerProps<T>) => {
  const [search, setSearch] = useState('');
  const { data: CustomerOptions, isLoading } = useGetCustomers(search);
  const { data: customer } = useGetCustomer(Number(form.getValues(name)));

  const handleChangeFilter = (value: string) => setSearch(value);

  return (
    <SelectBase
      form={form}
      name={name}
      inputLabel="Clientes"
      options={CustomerOptions}
      onChangeFilter={handleChangeFilter}
      isLoading={isLoading}
      isBig
      label={customer?.denominacion}
    />
  );
};
