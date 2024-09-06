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
import { useLoginUser } from '../Hooks';
import { useEffect, useState } from 'react';
import { useRegisterUser } from '../Hooks/useRegisterUser';

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
      username: z.string().min(1, { message: 'Enter an email' }).email({
        message: 'Enter a correct format email',
      }),
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
        path: ['rePassword', 'password'],
      },
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: 'nico@123456.com',
      password: '12313123asd',
      rePassword: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (registrationMode) return mutateRegister(values);
    mutateLogin(values);
  };

  const handleSecondary = () => {
    setRegistrationMode((prevState) => !prevState);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8 my-16 w-full"
      >
        <FormField
          name="username"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email o nombre de usuario</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input {...field} />
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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
      </form>
    </Form>
  );
};
