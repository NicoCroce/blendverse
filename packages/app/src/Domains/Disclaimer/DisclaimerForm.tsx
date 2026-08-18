import { AlertMessage, Button, Container, Input } from '@app/Application';
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
  termsVersion: number | null;
  onSuccess?: () => void;
}

export const DisclaimerForm = ({
  termsVersion,
  onSuccess,
}: DisclaimerFormProps) => {
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
    if (termsVersion === null) {
      form.setError('root', {
        type: 'manual',
        message:
          'No se puede aceptar: la versión vigente de los términos no está disponible.',
      });
      return;
    }

    mutate({ password, termsVersion });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {termsVersion === null && (
          <AlertMessage
            variant="warning"
            title="Términos no disponibles"
            description="No se puede aceptar los términos hasta que exista una versión vigente."
          />
        )}
        {form.formState.errors.root?.message && (
          <div className="text-sm text-red-500">
            {form.formState.errors.root.message}
          </div>
        )}
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
          <Button
            type="submit"
            isLoading={isPending}
            disabled={termsVersion === null}
          >
            Aceptar términos
          </Button>
        </Container>
      </form>
    </Form>
  );
};
