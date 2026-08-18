import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Input } from '../Input';
import { Container } from '../../Layout';

interface DateRangeProps<T extends FieldValues> {
  nameStartDate: Path<T>;
  nameEndDate: Path<T>;
  label: string;
  form: UseFormReturn<T>;
}

export const DateRange = <T extends FieldValues>({
  nameStartDate,
  nameEndDate,
  form,
}: DateRangeProps<T>) => {
  const startDate = form.watch(nameStartDate);

  return (
    <Container>
      <Container row justify="between" className="[&>*]:flex-1">
        <FormField
          name={nameStartDate}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de inicio</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  className="block"
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name={nameEndDate}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de fin</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  value={field.value || ''}
                  className="block"
                  disabled={startDate === undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Container>
    </Container>
  );
};
