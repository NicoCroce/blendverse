import { useMemo } from 'react';
import { SelectField } from '@app/Aplication/Components/Molecules/FormFields/SelectField';
import { Combobox, ComboboxBigSearch } from '../../Organisms';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { FontAwesomeIconProps } from '@fortawesome/react-fontawesome';

interface SelectBaseProps<T extends FieldValues> {
  name: Path<T>;
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
  handleCleanIcon?: FontAwesomeIconProps['icon'];
}

export const SelectBase = <T extends FieldValues>({
  name,
  form,
  enableClean = false,
  inputLabel,
  options,
  onChangeFilter,
  isLoading = false,
  isBig = false,
  handleCleanIcon,
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

  return (
    <SelectField
      control={form.control}
      name={name}
      label={inputLabel}
      onChangeOmit
      combobox={
        isBig && onChangeFilter ? (
          <ComboboxBigSearch
            options={memoOptions}
            onChangeValue={handleChange}
            onChangeFilter={onChangeFilter}
            isLoading={isLoading}
          />
        ) : (
          <Combobox options={memoOptions} onChangeValue={handleChange} />
        )
      }
      handleClean={enableClean ? handleClean : undefined}
      handleCleanIcon={handleCleanIcon}
    />
  );
};
