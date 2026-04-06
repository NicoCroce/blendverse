import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { useGetProfiles } from './Hooks/useGetProfiles';
import { SelectBase } from '../SelectBase';
import { useGetProfile } from '@app/Domains/Profiles';

interface SelectProfileProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T>;
}

export const SelectProfile = <T extends FieldValues>({
  name,
  form,
}: SelectProfileProps<T>) => {
  const [search, setSearch] = useState('');
  const { data: ProfileOptions, isLoading } = useGetProfiles(search);
  const { data: profile } = useGetProfile(Number(form.getValues(name)));

  const handleChangeFilter = (value: string) => setSearch(value);

  return (
    <SelectBase
      form={form}
      name={name}
      inputLabel="Perfiles"
      options={ProfileOptions}
      onChangeFilter={handleChangeFilter}
      isLoading={isLoading}
      isBig={false}
      label={profile?.denominacion}
    />
  );
};
