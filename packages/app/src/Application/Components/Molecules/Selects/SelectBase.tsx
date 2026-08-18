import { useMemo } from 'react';
import { SelectField } from '@app/Application/Components/Molecules/FormFields/SelectField';
import { Combobox, ComboboxBigSearch } from '../../Organisms';
import { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

interface SelectBaseProps<
  T extends FieldValues,
  TName extends FieldPath<T> = FieldPath<T>,
> {
  name: TName;
  enableClean?: boolean;
  form: UseFormReturn<T>;
  inputLabel: string;
  options?: Array<{
    value: number | string;
    label: string;
  }>;
  onChangeFilter?: (value: string) => void;
  isLoading?: boolean;
  isBig?: boolean;
  label?: string;
}

export const SelectBase = <T extends FieldValues, TName extends FieldPath<T>>({
  name,
  form,
  enableClean = false,
  inputLabel,
  options,
  onChangeFilter,
  isLoading = false,
  isBig = false,
  label,
}: SelectBaseProps<T, TName>) => {
  const memoOptions = useMemo(() => {
    return options?.map(({ value, label }) => ({
      label,
      value: String(value) || '',
    }));
  }, [options]);

  const handleChange = (value: string) => form.setValue(name, value as never);

  const handleClean = () => form.setValue(name, '' as never);

  return (
    <SelectField
      control={form.control}
      name={name}
      label={inputLabel}
      onChangeOmit
      combobox={
        isBig && onChangeFilter ? (
          <ComboboxBigSearch
            value={form.getValues(name)}
            options={memoOptions}
            onChangeValue={handleChange}
            onChangeFilter={onChangeFilter}
            isLoading={isLoading}
            label={label || ''}
          />
        ) : (
          <Combobox
            value={form.getValues(name)}
            options={memoOptions}
            onChangeValue={handleChange}
          />
        )
      }
      handleClean={enableClean ? handleClean : undefined}
    />
  );
};
