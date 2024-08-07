import { useAddUser } from '../Hooks';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app/Aplication/Components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@app/Aplication/Components/ui/input';
import { Button } from '@app/Aplication/Components';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { USERS_ROUTE } from '../UsersRoutes';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  mail: z.string().min(1, { message: 'Enter an email' }).email({
    message: 'Enter a correct format email',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters',
  }),
});

export const NewUserForm = () => {
  const { mutate } = useAddUser();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      mail: '',
      password: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
    toast.success('Usuario agregado');
    navigate(USERS_ROUTE);
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    navigate(-1);
  };

  const { formState } = form;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8 m-auto"
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de Usuario</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              {!formState.errors.name ? (
                <FormDescription>Nombre de usuario a registrar</FormDescription>
              ) : (
                <FormMessage />
              )}
            </FormItem>
          )}
        ></FormField>
        <FormField
          name="mail"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email de Usuario</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña de Usuario</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        ></FormField>
        <div className="flex justify-stretch gap-4">
          <Button className="flex-1" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1">
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
};
