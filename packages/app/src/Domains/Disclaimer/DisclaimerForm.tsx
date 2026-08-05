import { Button, Container, Input } from '@app/Application';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app/Application/Components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSignDisclaimer } from './Hooks/useDisclaimer';

const formSchema = z.object({
  password: z.string().min(1, 'Debe ingresar su contraseña'),
});

interface DisclaimerFormProps {
  onSuccess?: () => void;
}

export const DisclaimerForm = ({ onSuccess }: DisclaimerFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  });

  const { mutate, isPending, isSuccess, error } = useSignDisclaimer();

  if (isSuccess) {
    onSuccess?.();
    return null;
  }

  const handleSubmit = ({ password }: z.infer<typeof formSchema>) => {
    mutate({ password } as never);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {error && (
          <div className="text-sm text-red-500">
            Contraseña incorrecta. Intente nuevamente.
          </div>
        )}
        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input.Password
                  {...field}
                  placeholder="Ingrese su contraseña para firmar"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Container row justify="end" className="pt-4">
          <Button type="submit" isLoading={isPending}>
            Aceptar términos
          </Button>
        </Container>
      </form>
    </Form>
  );
};
