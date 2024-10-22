import { Button, Container } from '@app/Aplication';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app/Aplication/Components/ui/form';
import { Input } from '@app/Aplication/Components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AUTH_ROUTE } from '../Auth.routes';
import { useNavigate } from 'react-router-dom';
import { useRestorePassword } from '../Hooks';

const formScheme = z.object({
  mail: z.string().min(1, { message: 'Ingrese un mail' }).email({
    message: 'Ingrese un mail válido',
  }),
});

export const RestorePassword = () => {
  const navigate = useNavigate();
  const { mutate } = useRestorePassword();
  const form = useForm<z.infer<typeof formScheme>>({
    resolver: zodResolver(formScheme),
    defaultValues: { mail: '' },
  });

  const handleSubmit = ({ mail }: z.infer<typeof formScheme>) => mutate(mail);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8 w-full"
      >
        <FormField
          name="mail"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Container row justify="end">
          <Button type="submit">Recuperar contraseña</Button>
          <Button
            type="button"
            appearance="cancel"
            onClick={() => navigate(AUTH_ROUTE)}
          >
            Cancelar
          </Button>
        </Container>
      </form>
    </Form>
  );
};
