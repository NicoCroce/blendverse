import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
//import { useGetPricelisttypes } from './Hooks/useGetPricelisttypes';
import { SelectBase } from '../SelectBase';
import { useGetPricelisttypes } from './Hooks/useGetPricelisttypes';
import { useGetPricelisttype } from './Hooks/useGetPricelisttype';

interface SelectPricelisttypeProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T>;
}

export const SelectPricelisttype = <T extends FieldValues>({
  name,
  form,
}: SelectPricelisttypeProps<T>) => {
  const { data: PricelisttypeOptions, isLoading } = useGetPricelisttypes();
  const { data: pricelisttype } = useGetPricelisttype(
    Number(form.getValues(name)),
  );

  return (
    <SelectBase
      form={form}
      name={name}
      inputLabel="Tipo Lista Precios"
      options={PricelisttypeOptions}
      isLoading={isLoading}
      isBig={false}
      label={pricelisttype?.denominacion}
    />
  );
};
