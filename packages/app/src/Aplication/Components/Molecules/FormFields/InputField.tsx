import { Control, FieldValues, Path } from 'react-hook-form';
import {
  FormControl,
  FormField as FormFieldComponent,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import React from 'react';

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  children: React.ReactNode;
  label: string;
}

export const InputField = <T extends FieldValues>({
  name,
  control,
  children,
  label,
}: FormFieldProps<T>) => {
  return (
    <FormFieldComponent
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {React.isValidElement(children)
              ? React.cloneElement(children, { ...field }) // Clona el nodo y le pasa las props
              : children}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
