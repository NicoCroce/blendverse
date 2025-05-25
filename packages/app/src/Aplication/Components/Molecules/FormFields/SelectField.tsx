import { Control, FieldValues, Path } from 'react-hook-form';
import {
  FormControl,
  FormField as FormFieldComponent,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Container } from '../../Layout';
import { Button } from '../Button';
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { ComboboxProps } from '../../Organisms';

interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  combobox: React.ReactElement<ComboboxProps>;
  handleClean?: () => void;
  handleCleanIcon?: FontAwesomeIconProps['icon'];
  onChangeOmit?: boolean;
}

export const SelectField = <T extends FieldValues>({
  name,
  control,
  combobox,
  label,
  handleClean,
  handleCleanIcon = faTrashCan,
  onChangeOmit = false,
}: SelectFieldProps<T>) => {
  return (
    <FormFieldComponent
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Container row>
              {React.isValidElement(combobox)
                ? React.cloneElement(combobox, {
                    value: field.value,
                    ...(!onChangeOmit && { onChangeValue: field.onChange }),
                  })
                : combobox}
              {handleClean && (
                <Button type="button" variant="outline" onClick={handleClean}>
                  <FontAwesomeIcon icon={handleCleanIcon}></FontAwesomeIcon>
                </Button>
              )}
            </Container>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
