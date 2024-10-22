import { Button, Container } from '@app/Aplication';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app/Aplication/Components/ui/form';
import { Input } from '@app/Aplication/Components';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLoginUser } from '../Hooks';
import { useEffect, useState } from 'react';
import { useRegisterUser } from '../Hooks/useRegisterUser';
import { Link } from 'react-router-dom';
import { RESTORE_PASSWORD } from '../Auth.routes';

export const LoginForm = () => {
  const { mutate: mutateLogin, isPending } = useLoginUser();
  const {
    mutate: mutateRegister,
    isSuccess,
    isPending: isPendingRegister,
  } = useRegisterUser();
  const [registrationMode, setRegistrationMode] = useState(false);

  useEffect(() => {
    if (isSuccess) setRegistrationMode(false);
  }, [isSuccess]);

  const formSchema = z
    .object({
      mail: z.string().min(1, { message: 'Enter an email' }).email({
        message: 'Enter a correct format email',
      }),
      name: registrationMode
        ? z.string().min(1, { message: 'Ingrese un nombre válido' })
        : z.string(),
      password: z.string().min(8, {
        message: 'La contraseña debe ser mayor a 8 caracteres',
      }),
      rePassword: registrationMode
        ? z.string().min(8, {
            message: 'La contraseña debe ser mayor a 8 caracteres',
          })
        : z.string(),
    })
    .refine(
      (data) => {
        if (registrationMode) {
          return data.password === data.rePassword;
        }
        return true;
      },
      {
        message: 'Las contraseñas no coinciden',
        path: ['rePassword'],
      },
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mail: '',
      name: '',
      password: '',
      rePassword: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (registrationMode) return mutateRegister(values);
    mutateLogin(values);
  };

  const handleSecondary = () => {
    form.setValue('rePassword', '');
    setRegistrationMode((prevState) => !prevState);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="my-8 space-y-4 md:space-y-6 md:my-16 w-full"
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
        {registrationMode && (
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de usuario</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Constraseña</FormLabel>
              <FormControl>
                <Input.Password {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {registrationMode && (
          <FormField
            name="rePassword"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ingrese nuevamente la Constraseña</FormLabel>
                <FormControl>
                  <Input.Password {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Container justify="between" className="md:flex-row !mt-4">
          <Link to={RESTORE_PASSWORD} className="flex items-center">
            ¿Olvidaste tu contraseña?
          </Link>
          <Container row justify="end">
            <Button type="submit" isLoading={isPending || isPendingRegister}>
              {registrationMode ? 'Aceptar' : 'Ingresar'}
            </Button>
            <Button
              variant="outline"
              onClick={handleSecondary}
              disabled={isPending || isPendingRegister}
            >
              {registrationMode ? 'Cancelar' : 'Registrarse'}
            </Button>
          </Container>
        </Container>
      </form>
    </Form>
  );
};
