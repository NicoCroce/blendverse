import { useEffect, useMemo } from 'react';
import { SelectField } from '@app/Aplication/Components/Molecules/FormFields/SelectField';
import { ComboboxBigSearch } from '../../Organisms';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';

interface SelectBaseProps<T extends FieldValues> {
  name: Path<T>;
  enableClean?: boolean;
  form: UseFormReturn<T>;
  inputLabel: string;
  options?: Array<{
    value: number;
    label: string;
  }>;
  onChangeFilter: (value: string) => void;
}

export const SelectBase = <T extends FieldValues>({
  name,
  form,
  enableClean = false,
  inputLabel,
  options,
  onChangeFilter,
}: SelectBaseProps<T>) => {
  const memoOptions = useMemo(() => {
    return options?.map(({ value, label }) => ({
      label,
      value: String(value) || '',
    }));
  }, [options]);

  const handleChange = (value: string) =>
    form.setValue(name, value as PathValue<T, Path<T>>);

  const handleClean = () =>
    form.setValue(name, undefined as PathValue<T, Path<T>>);

  useEffect(() => {
    console.log(form.getValues());
  }, [form]);

  return (
    <SelectField
      control={form.control}
      name={name}
      label={inputLabel}
      onChangeOmit
      combobox={
        <ComboboxBigSearch
          options={memoOptions}
          onChangeValue={handleChange}
          onChangeFilter={onChangeFilter}
        />
      }
      handleClean={enableClean ? handleClean : undefined}
    />
  );
};
