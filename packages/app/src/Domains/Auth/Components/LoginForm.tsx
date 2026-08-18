import { Button, Container } from '@app/Application';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app/Application/Components/ui/form';
import { Input } from '@app/Application/Components/Molecules/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLoginUser } from '../Hooks';
import { Link } from 'react-router-dom';
import { RESTORE_PASSWORD } from '../Auth.routes';

export const LoginForm = () => {
  const { mutate: mutateLogin, isPending } = useLoginUser();

  const formSchema = z.object({
    mail: z.string().min(1, { message: 'Enter an email' }).email({
      message: 'Enter a correct format email',
    }),
    password: z.string().min(8, {
      message: 'La contraseña debe ser mayor a 8 caracteres',
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mail: '',
      password: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    mutateLogin(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="my-8 space-y-4 md:space-y-6 md:my-16 w-full"
      >
        <Container space="large">
          <FormField
            name="mail"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} forceEnabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Constraseña</FormLabel>
                <FormControl>
                  <Input.Password {...field} forceEnabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Container justify="between" className="md:flex-row mt-4!">
            <Link to={RESTORE_PASSWORD} className="flex items-center">
              ¿Olvidaste tu contraseña?
            </Link>
            <Container row justify="end">
              <Button type="submit" isLoading={isPending} className="w-full">
                Ingresar
              </Button>
            </Container>
          </Container>
        </Container>
      </form>
    </Form>
  );
};
