import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { useGetTaxconditions } from './Hooks/useGetTaxconditions';
import { SelectBase } from '../SelectBase';
interface SelectTaxconditionProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T>;
}

export const SelectTaxcondition = <T extends FieldValues>({
  name,
  form,
}: SelectTaxconditionProps<T>) => {
  const { data: TaxconditionOptions, isLoading } = useGetTaxconditions();

  return (
    <SelectBase
      form={form}
      name={name}
      inputLabel="Condicion Fiscal"
      options={TaxconditionOptions}
      isLoading={isLoading}
      isBig={false}
    />
  );
};
