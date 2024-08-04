/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from '@hookform/resolvers/zod';
import { Path, useForm } from 'react-hook-form';
import { TypeOf, z } from 'zod';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from '@app/Aplication/Components/ui/form';
import { Button } from '@app/Aplication/Components';

interface BaseFormProps<TScheme extends z.ZodType<any, any, any>> {
  name: string;
  label: string;
  description: string;
  formSchema: TScheme;
  component: React.ElementType;
  handleSubmit: (values: z.infer<TScheme>) => void;
}

export const BaseForm = <TScheme extends z.ZodType<any, any, any>>({
  name,
  label,
  formSchema,
  description,
  component: Component,
  handleSubmit,
}: BaseFormProps<TScheme>) => {
  const form = useForm<z.infer<TScheme>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
    } as z.infer<TScheme>,
  });

  const handleSubmitInternal = (values: z.infer<TScheme>) => {
    console.log('pasaaa');
    handleSubmit(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitInternal)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name={name as Path<TypeOf<TScheme>>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <Component {...field} />
              </FormControl>
              <FormDescription>{description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
