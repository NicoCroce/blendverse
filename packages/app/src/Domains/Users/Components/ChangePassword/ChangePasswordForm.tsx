import { Button, Container, Input } from '@app/Aplication';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app/Aplication/Components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useChangePassword } from '../../Hooks';

const formSchema = z
  .object({
    password: z.string().min(8, {
      message: 'La contraseña debe ser mayor a 8 caracteres',
    }),
    newPassword: z.string().min(8, {
      message: 'La contraseña debe ser mayor a 8 caracteres',
    }),
    rePassword: z.string().min(8, {
      message: 'La contraseña debe ser mayor a 8 caracteres',
    }),
  })
  .refine((data) => data.newPassword === data.rePassword, {
    message: 'Las contraseñas no coinciden',
    path: ['rePassword'],
  });

interface ChangePasswordFormProps {
  onClose?: () => void;
}

export const ChangePasswordForm = ({ onClose }: ChangePasswordFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      newPassword: '',
      rePassword: '',
    },
  });

  const { mutate, isSuccess, isPending } = useChangePassword();

  if (isSuccess) {
    if (onClose) onClose();
    return null;
  }

  const handleSubmit = ({
    password,
    newPassword,
    rePassword,
  }: z.infer<typeof formSchema>) => {
    mutate({
      password,
      newPassword,
      rePassword,
    });
  };

  const handleCancel = () => {
    if (onClose) onClose();
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña actual</FormLabel>
              <FormControl>
                <Input.Password {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="newPassword"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña nueva</FormLabel>
              <FormControl>
                <Input.Password {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="rePassword"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ingrese nuevamente la contraseña nueva</FormLabel>
              <FormControl>
                <Input.Password {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Container row justify="end" className="pt-4">
          {onClose && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" isLoading={isPending}>
            Aceptar
          </Button>
        </Container>
      </form>
    </Form>
  );
};
